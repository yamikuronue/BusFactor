module.exports = {

	reportError: function(err) {
		console.log("Error while scanning repository!");
		console.log(err);
	},

	report: function(data) {
		console.log("File owners:");
		console.log("========================");
		
		for (var i = 0; i < data.numfiles; i++) {
			var owner = data.files[i].owner;
			console.log(owner + "\t\t" + data.files[i].filename);
		}

		console.log("\n\n");
		console.log("Authors:")
		console.log("========================");

		for (var i = 0; i < data.numAuthors; i++) {
			var currAuthor = data.ownersSorted[i];
			console.log(currAuthor + "(" + data.owners[currAuthor] + ") [" + Math.round((data.owners[currAuthor]/data.numfiles * 100)) + "%]");
				
			if (i == data.busFactor-1) {
				console.log("---------Bus has killed project----------");
			}				
		}


		console.log("\n\n");
		console.log("Bus factor: " + data.busFactor);
		console.log("Total files: " + data.numfiles);
	}
}