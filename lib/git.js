var Repo = require( "git-tools" );
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var cp = require("child_process");

//Argle barlge stupid broken tools
var gitblame = require("git-blame");
var repo, wc;

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
	
	getOwner: function(file, callback) {
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
			} );

		child.stdout.on("data", function (data) {
			lines = data.toString("utf-8").split("\n");
			
			async.each(lines,function(line, cb) {
				var match = linepatt.exec(line);
				if (!match) {
					//console.log("mismatch:" + line)
					return;
				}
				var author = match[3].trim();
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