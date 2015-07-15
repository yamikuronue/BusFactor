var spawn = require("child_process").spawn;
var fs = require("fs");
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var repo;

module.exports = {	
	init: function(url, locallocation, callback) {
		rimraf(locallocation, function() {
			fs.mkdirSync(locallocation);


			child = spawn("svn", [
				//Command-line arguments, in order
				"checkout",
				repo,
				dirname,
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
				callback(err, dirname);
			});
		})
	},
	
	getOwner: function(file, callback) {
		var fileAuthors = {};
		//console.log(repo);
		//TODO
		/*child = spawn("svn", [
			//Command-line arguments, in order
			"merge",
			"--reintegrate",
			branch,
			"--no-auth-cache",
			"--non-interactive",
			"--trust-server-cert"
			],
			{
				cwd: working_copy
			} );*/
	}
	
	
}