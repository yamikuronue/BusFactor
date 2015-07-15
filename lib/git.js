var Repo = require( "git-tools" );
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");

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
		repo.blame({
			path: file
		}, function(err, blameArray) {
			if (err) {
				console.log(err); callback(err); return;
			}
			async.each(blameArray,function(blameObj, cb) {
				if (!blameObj.commit) {
					cb(); return;
				}
				repo.authors(blameObj.commit, function(err, authors) {
					if(err) {
						cb(err);
						return;
					}
					if (!fileAuthors[authors[0].name]) {
						fileAuthors[authors[0].name] = 0;
					};
					
					fileAuthors[authors[0].name]++;
					cb();
				})
			}, function(err){
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
		})
	}
	
	
}