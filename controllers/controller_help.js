var path = require('path'),
	fs = require('fs'),
	colog = require('colog'),
	lineReader = require('line-reader');

var PATH = '../man/ttlogn.1',
	COMMENT = '.\\"',
	TITLE = '.TH',
	SUBTITLE = '.SH',
	NO_ITEM = false,
	IS_ITEM = true,
	ITEM = '.IP',
	WITHOUT_QUOTES = /(")/g;

/*
pline: line to read
pisItem: is if item, for indexation 
display the man page line by line
*/
var printHelp =  function(pline, pisItem){

	var words = pline.split(' '),
		format = words[0];

	switch(format){
		case TITLE:
			pisItem = NO_ITEM;
			break;
		case SUBTITLE:
			line = pline.replace(SUBTITLE, '');
			colog.log(colog.apply(line, ['bold']));
			pisItem = NO_ITEM;
			break;
		case ITEM:
			line = pline.replace(ITEM, '');
			line = line.replace(WITHOUT_QUOTES, '');
			console.log('\t' + line);
			pisItem = IS_ITEM;
			break;
		case COMMENT:
			break;
		default:
			if(pisItem){
				console.log('\t\t' + pline );
			}
			else{
				console.log('\t' + pline);
			}
		}
	return pisItem;
};


var task = {

	/*
	reads line by line the man page to display it
	*/
	displayHelp: function(){
		var isItem = false;
		helpPath = path.resolve(__dirname, PATH);

		lineReader.eachLine(helpPath, function(line, last) {
			isItem = printHelp(line, isItem);
		});
	}

};

module.exports = task;