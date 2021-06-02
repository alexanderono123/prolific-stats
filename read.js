const reader = new FileReader()

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

reader.onload = function (e) {
	let ignore_commas = false;
	let container = [], studies = [], study_count = [], study_labels = [], study_dataset = [];
	let highest_bonus = 0, highest_payout = 0, studies_timed_out = 0,
	 studies_returned = 0, studies_rejected = 0;
	let selector = 0, start = 67, count = 0;
    let long_string = e.target.result;

	while(start != long_string.length){
		ignore_commas = check_for_double_quotes(ignore_commas, long_string, start, count);
		if(long_string.charAt(start + count) == ',' && !ignore_commas){
			switch(selector){
				case 0:
					container[0] = long_string.substr(start, count);
					break;
				case 1:
					container[1] = long_string.substr(start, count);
					container[1] = container[1].substr(1, container[1].length - 1);
					container[1] = +container[1].trim() * 100;
					break;
				case 2:
					container[2] = long_string.substr(start, count);
					container[2] = container[2].substr(1, container[2].length - 1);
					container[2] = +container[2] * 100;
					break;
				case 3:
					container[3] = long_string.substr(start, count);
					container[3] = container[3].substr(0, 10);
					container[3] = new Date(container[3]);
					break;
				case 4:
					container[4] = long_string.substr(start, count);
					break;
				case 5:
					container[5] = long_string.substr(start, count);
					switch(long_string.charAt(start + count + 1)){
						case 'A': 
							container[6] = 'APPROVED';
							start = start + count + 11;
							highest_payout = check_for_highest_payout(highest_payout, container[1]);
							highest_bonus = check_for_highest_bonus(highest_bonus, container[2]);
							break;
						case 'R':
							if(long_string.charAt(start + count + 3) == 'J'){
								container[6] = 'REJECTED';
								studies_rejected += 1;
							} else {
								container[6] = 'RETURNED';
								studies_returned += 1;
							}
							start = start + count + 11;
							break;
						case 'T':
							container[6] = 'TIMED-OUT';
							start = start + count + 12;
							studies_timed_out += 1;
							break;
						default:
							break;
					}
					
					if(container[6] = 'APPROVED'){
						study_count = update_study_count(study_count, container);
					}
					
					break;
				default:
					alert('Something has gone wrong with the selector');
					break;
			}
			if(selector == 5){
				selector = 0;
				studies.push(container);
				container = [];
			} else {
				selector += 1;
				start = start + count + 1;
			}
			
			count = 0;
		} else {
			count +=1;
		}
	}
	document.querySelector('.output').innerText = `Highest ever payout = ${highest_payout / 100}
	 Highest ever bonus = ${highest_bonus / 100}
	 Studies returned = ${studies_returned}
	 Studies rejected by researcher = ${studies_rejected}
	 Studies timed out of = ${studies_timed_out}`;

	 console.log(study_count);
	 console.log(studies);

	 study_count.sort(function(a,b){
	 return a[0] - b[0];
	 });

	 for (i = 0 ; i < study_count.length ; i++){
		study_labels.push(study_count[i][0].toDateString());
		study_dataset.push(study_count[i][1]);

	}
	console.log(study_labels);
	console.log(study_dataset);
	load_graph(study_labels, study_dataset);
}

function check_for_double_quotes(bool, str, start, count){
	if(str.charAt(start + count) == "\""){
		bool = !bool;
	}
	return bool;
}

function check_for_highest_payout(highest_payout, current_payout){
	if(current_payout > highest_payout){
		highest_payout = current_payout;
	}
	return highest_payout;
}

function check_for_highest_bonus(highest_bonus, current_bonus){
	if(current_bonus > highest_bonus){
		highest_bonus = current_bonus;
	}
	return highest_bonus;
}

function update_study_count(study_count, container){
	if(study_count.length == 0){
		study_count.push([container[3], 1]);
	} else {
		let found = false;
		for (i = 0 ; i < study_count.length ; i++){
			if( study_count[i][0].toDateString() == container[3].toDateString()){
				study_count[i][1] += 1;
				found = true;
			}
		}
		if(found == false){
			study_count.push([container[3], 1]);
		}
	}
	return study_count;
}