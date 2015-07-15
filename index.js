var url = "https://github.com/yamikuronue/BusFactor.git"; //TODO: paramaterize

var repoAdapter = require("./lib/git"); //TODO: allow svn
var recursive = require('recursive-readdir');
var Path = require("path");

var async = require("async");
 
var files = [];
var location = Path.join("tmp","wc1");

repoAdapter.init(url, location, function(err) {
	if (err) {
		console.log(err); return;
	}
	recursive(location, [Path.join("**",".git","*"),".gitignore",'LICENSE','README.md'], function (err, lsFiles) {
		async.each(lsFiles,function(file, cb) {
			file = file.replace(location + Path.sep,"");
			repoAdapter.getOwner(file,function(err, owner) {
				if (!err) {
					files.push({
						"filename": file,
						"owner": owner
					});
				};
				cb(err);
			})
		}, function(err) {
			var numfiles = files.length;
			console.log("File owners:");
			console.log("========================");
			for (var i = 0; i < numfiles; i++) {
				console.log(files[i].owner + "\t\t" + files[i].filename);
			}
		});
	});

})