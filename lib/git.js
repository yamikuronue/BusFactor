var Repo = require( "git-tools" );
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var cp = require("child_process");

//Argle barlge stupid broken tools
var gitblame = require("git-blame");
var repo, wc, aliases;

module.exports = {
	init: function(url, locallocation, callback) {
		rimraf(locallocation, function() {
			Repo.clone({
				repo: url,
				dir: locallocation
			}, function(err, r) {
				repo = r;
				wc = locallocation;
				callback(err);
			});
		})
	},
	
	loadAliases: function(callback) {
		var aliases = {};
		child = cp.spawn("git", [
			//Command-line arguments, in order
			"log",
			"--all",
			"--format='%aN <%cE>' "
			],
			{
				cwd: wc
			} 
		);
		
		var linepatt = /'(.+)\s<(.+)>'/i;
		child.stdout.on("data", function (data) {
			lines = data.toString("utf-8").split("\n");
			
			async.each(lines,function(line, cb) {
				var match = linepatt.exec(line);
				if (!match) {
					return;
				}
				
				aliases[match[1].trim()] = match[2];
			});
		});
		
		child.on("close", function (code) {
			callback(aliases);
		});
		
	},
	getOwner: function(file, callback) {
		if(!aliases) {
			module.exports.loadAliases(function(ali) {
				aliases = ali;
				module.exports.getOwner_internal(file, callback);
			})
		} else {
			module.exports.getOwner_internal(file, callback);
		}
	},
	
	getOwner_internal: function(file, callback) {
		var fileAuthors = {};
		var err = null;
		var linepatt = /^[\^\?]*([0-9a-f.]+)\s(\S*\s+)?\((.+?)\d/i;
		
		child = cp.spawn("git", [
			//Command-line arguments, in order
			"blame",
			file
			],
			{
				cwd: wc
			} 
		);

		child.stdout.on("data", function (data) {
			lines = data.toString("utf-8").split("\n");
			
			async.each(lines,function(line, cb) {
				var match = linepatt.exec(line);
				if (!match) {
					//console.log("mismatch:" + line)
					return;
				}
				var author = match[3].trim();
				var email = aliases[author] || "unknown!";
				if (!fileAuthors[email]) {
					fileAuthors[email] = {};
				};
				
				if (!fileAuthors[email][author]) {
					fileAuthors[email][author] = 0;
				};
				
				fileAuthors[email][author]++;
			});
		});

		child.stderr.on("data", function (data) {
			err = new Error(data.toString("utf-8"));
		});

		child.on("close", function (code) {
			if(err) {
				callback(err); return;
			}
							
			var max = 0;
			var winner = "";
			for(email in fileAuthors) {
				var total = 0;
				for (alias in fileAuthors[email]) {
					total += fileAuthors[email][alias];
				}
				if (total > max) {
					max = total;
					winner = email;
				}
			}
			
			module.exports.getCanonicalName(winner, function(name) {
				callback(err, name);
			})
		});
	},
	
	getCanonicalName: function(file, callback) {
		if(!aliases) {
			module.exports.loadAliases(function(ali) {
				aliases = ali;
				module.exports.getCanonicalName_internal(file, callback);
			})
		} else {
			module.exports.getCanonicalName_internal(file, callback);
		}
	},
	
	getCanonicalName_internal: function(email, callback) {
		child = cp.spawn("git", [
			//Command-line arguments, in order
			"shortlog",
			"-s",
			"-n"
			],
			{
				cwd: wc
			} 
		);
		
		var linepatt = /\s+(\d+)\s+(.+)/i;
		var max = 0;
		var winner = "";
		
		child.stdout.on("data", function (data) {
			lines = data.toString("utf-8").split("\n");

			async.each(lines,function(line, cb) {
				var match = linepatt.exec(line);
				if (!match) {
					return;
				}
				
				var numCommits = match[1].trim();
				var name = match[2].trim();
								
				if (aliases[name.trim()] === email.trim() && numCommits > max) {
					max = numCommits;
					winner = name;
				}
				cb();
			});
		});
		child.stderr.on("data", function (data) {
			console.log(data.toString("utf-8"));
		});
		
		child.on("close", function (code) {
			callback(winner);
		});
	},
	
	
}