var recursive = require('recursive-readdir');
var Path = require("path");
var async = require("async");
 
var files = [];
var location = Path.join("tmp","wc4"); //TODO: this ought to be better

var argv = require('yargs')
    .option('r', {
        alias : 'repo',
        demand: true,
        describe: 'Repository to scan',
        type: 'string',
        nargs: 1
    })
    .option('t', {
        alias : 'type',
        demand: false,
        default: 'auto',
        describe: 'Type of repository. Accepts "git", "svn", or "auto"',
        type: 'string',
        nargs: 1
    })
    .argv;

if (argv.type === 'auto') {
	if (argv.repo.indexOf('git') > -1) {
		argv.type = 'git';
		console.log("Auto-detected Git repository");
	} else if (argv.repo.indexOf('svn') > -1) {
		argv.type = 'svn';
		console.log("Auto-detected SVN repository");
	} else {
		console.log("Could not detect repository type, please be explicit!");
		return;
	}
}

var repoAdapter = require("./lib/" + argv.type.toLowerCase());


repoAdapter.init(argv.repo, location, function(err) {
	if (err) {
		console.log(err); return;
	}
	recursive(location, [Path.join("**",".git","*"),".gitignore",Path.join("**",".svn","*")], function (err, lsFiles) {
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
			if (err) {
				console.log("Error while scanning repository!");
				console.log(err);
				return;
			}
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