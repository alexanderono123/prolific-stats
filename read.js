const reader = new FileReader()

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

reader.onload = function (e) {
    let long_string = e.target.result;
    long_string = long_string.substring(0, 65);
	document.querySelector('.output').innerText = long_string;
}

/* 65 is the index of the last character of the header of the csv
ideas for making it work - check string char by char for a comma, 
incrementing a counter as we go, once a comma is found get the substr
of the previous index (should be right after last comma) and the counter
to successfully take the value from line, then repeat 
*/