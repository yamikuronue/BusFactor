var spawn = require("child_process").spawn;
var fs = require("fs");
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var wc;

module.exports = {	
	init: function(url, locallocation, callback) {
		rimraf(locallocation, function() {
			wc = locallocation;

			fs.mkdirSync(locallocation);

			child = spawn("svn", [
				//Command-line arguments, in order
				"checkout",
				url,
				locallocation,
				"--no-auth-cache",
				"--non-interactive",
				"--trust-server-cert"
				] );

			var err = null;

			child.stdout.on("data", function (data) {
				//console.log(data.toString("utf-8"));
			});

			child.stderr.on("data", function (data) {
				err = new Error(data.toString("utf-8"));
			});

			child.on("close", function (code) {
				callback(err);
			});
		})
	},
	
	getOwner: function(file, callback) {
		var fileAuthors = {};
		var err = null;
		var linepatt = /^\s(d+)\t+(\w+)\s*$/i;

		child = spawn("svn", [
			//Command-line arguments, in order
			"blame",
			file,
			"-x" //Ignore whitespace-only changes
			],
			{
				cwd: wc
			} );

		child.stdout.on("data", function (data) {
			var match = myRegexp.exec(data);
			if (!match) return;

			var author = match[1];
			if (!fileAuthors[author]) {
				fileAuthors[author] = 0;
			};
			fileAuthors[author]++;
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