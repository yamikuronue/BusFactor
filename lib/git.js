var Repo = require( "git-tools" );
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var spawn = require("child_process").spawn;

//Argle barlge stupid broken tools
var gitblame = require("git-blame");
var repo;

module.exports = {	
	init: function(url, locallocation, callback) {
		rimraf(locallocation, function() {
			Repo.clone({
				repo: url,
				dir: locallocation
			}, function(err, r) {
				repo = r;
				callback(err);
			});
		})
	},
	
	getOwner: function(file, callback) {
		var fileAuthors = {};
		var err = null;
		var linepatt = /^([0-9a-f]+)\s\((\S+)\s/i;

		child = spawn("git", [
			//Command-line arguments, in order
			"blame",
			file
			] );

		child.stdout.on("data", function (data) {
			lines = data.toString("utf-8").split("\n");
			
			async.each(lines,function(line, cb) {
				var match = linepatt.exec(line);
				if (!match) {
					return;
				}
				var author = match[2].trim();
				if (!fileAuthors[author]) {
					fileAuthors[author] = 0;
				};
				fileAuthors[author]++;
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
			for(auth in fileAuthors) {
				if (fileAuthors[auth] > max) {
					max = fileAuthors[auth];
					winner = auth;
				}
			}
			
			callback(err, winner);
		});
	}
	
	
}