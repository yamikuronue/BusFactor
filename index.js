var url = "https://github.com/SockDrawer/SockBot.git"; //TODO: paramaterize

var repoAdapter = require("./lib/git"); //TODO: allow svn
var recursive = require('recursive-readdir');
var Path = require("path");

var async = require("async");
 
var files = [];
var location = Path.join("tmp","wc4");

repoAdapter.init(url, location, function(err) {
	if (err) {
		console.log(err); return;
	}
	recursive(location, [Path.join("**",".git","*"),".gitignore"], function (err, lsFiles) {
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
			var candidates = {};
			console.log("File owners:");
			console.log("========================");
			for (var i = 0; i < numfiles; i++) {
				var owner = files[i].owner;
				if (!candidates[owner]) {
					candidates[owner] = 0;
				}
				candidates[owner]++;
				console.log(owner + "\t\t" + files[i].filename);
			}
			
			//Sort the authors
			var ownersSorted = Object.keys(candidates).sort(function(a,b){return candidates[b]-candidates[a]})
			var numAuthors = ownersSorted.length;
			
			var runningTotal = 0;
			var busFactor = 0;
			var dead = false;
			
			console.log("\n\n");
			console.log("Authors:")
			console.log("========================");
			for (var i = 0; i < numAuthors; i++) {
				runningTotal += candidates[ownersSorted[i]];	
				console.log(ownersSorted[i] + "(" + candidates[ownersSorted[i]] + ") [" + Math.round((candidates[ownersSorted[i]]/numfiles * 100)) + "%]");
				
				if (!dead) busFactor++;
				if (runningTotal >= numfiles/2 && !dead) {
					dead = true;
					console.log("---------Bus has killed project----------");
				}				
			}
			
			console.log("\n\n");
			console.log("Bus factor: " + busFactor);
			console.log("Total files: " + numfiles);
			
		});
	});

})