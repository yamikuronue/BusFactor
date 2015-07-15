var gitModule = require('../lib/git.js');
var svnModule = require('../lib/svn.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe("git adapter", function() {
	it("should interface with git correctly", function(done) {
		 this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			if (err) {
				console.log(err);
				assert.ok(false);
			}
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				done();
			})
		});
	});
});

describe("svn adapter", function() {
	it("should interface with SVN correctly", function(done) {
		 this.timeout(100000); //SVN is slow, it's a big repo
		svnModule.init("https://core.svn.wordpress.org/trunk/", "tmp/repo2",function() {
			svnModule.getOwner("license.txt", function(err, author) {
				assert.notOk(err);
				assert.equal("ryan", author);
				done();
			})
		});
	});
})