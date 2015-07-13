var gitModule = require('../lib/git.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe("git adapter", function() {
	it("should work", function(done) {
		 this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", function() {
			gitModule.getOwner("tests/repoTests.js", function(err, author) {
				assert.equal("yamikuronue", author);
				assert.falsey(err);
				done();
			})
		});
	});
	
	
})