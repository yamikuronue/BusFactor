var gitModule = require('../lib/git.js');
var svnModule = require('../lib/svn.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe("git adapter", function() {
	it("should work", function(done) {
		 this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function() {
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.equal("Yami", author);
				assert.notOk(err);
				done();
			})
		});
	});
});

describe("svn adapter", function() {
	it("should work", function(done) {
		 this.timeout(50000);
		svnModule.init("https://github.com/yamikuronue/BusFactor", "tmp/repo2",function() {
			svnModule.getOwner("test/repoTests.js", function(err, author) {
				assert.equal("Yami", author);
				assert.notOk(err);
				done();
			})
		});
	});
})