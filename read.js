const reader = new FileReader()

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

reader.onload = function (e) {
	let ignore_commas = false;
	let container = [], studies = [], study_count = [], study_labels = [], study_dataset = [];
    let long_string = e.target.result;
	let highest_bonus = 0, highest_payout = 0, studies_timed_out = 0,
	 studies_returned = 0, studies_rejected = 0;
	let selector = 0, start = 67, count = 0;

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
					container[6] = get_study_result(start + count + 1, long_string);
					start = get_start(container[6], start, count);
				
					if(container[6] = 'APPROVED'){
						highest_payout = check_for_highest_payout(highest_payout, container);
						highest_bonus = check_for_highest_bonus(highest_bonus, container);
						study_count = update_study_count(study_count, container);
					
					}

					studies.push(container);
					count = 0, selector = 0, container = [];
					break;
				default:
					alert('Something has gone wrong with the selector');
					break;

			}
				selector += 1;
				start = start + count + 1;
				count = 0;
		} else {
			count +=1; // move forward a character
		}
	}
	document.querySelector('.output').innerText = `Highest ever payout = ${highest_payout / 100},
	 Highest ever bonus = ${highest_bonus / 100},
	 Studies returned = ${studies_returned},
	 Studies rejected by researcher = ${studies_rejected},
	 Studies timed out of = ${studies_timed_out}`;
	 console.log(studies);
	 study_count.sort(function(a,b){
	 return a[0] - b[0];
	 });
	 for (i = 0 ; i < study_count.length ; i++){
		study_labels.push(study_count[i][0].toDateString());
		study_dataset.push(study_count[i][1]);

	}
	load_graph(study_labels, study_dataset);
}

function check_for_double_quotes(bool, str, start, count){
	if(str.charAt(start + count) == "\""){
		bool = !bool;
	}
	return bool;
}

function check_for_highest_payout(payout, container){
	if(container[1] > payout){
		payout = container[1];
	}
	return payout;
}

function check_for_highest_bonus(bonus, container){
	if(container[1] > bonus){
		bonus = container[2];
	}
	return bonus;
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

function get_study_result(pos, long_string){
	console.log(long_string.charAt(pos));
	console.log(long_string.substr(pos));
	switch(long_string.charAt(pos)){
		case 'A': 
			return 'APPROVED';
			break;
		case 'R':
			if(long_string.charAt(pos + 3) == 'J'){
				return 'REJECTED';
				// studies_rejected += 1;
			} else {
				return 'RETURNED';
				// studies_returned += 1;
			}
			break;
		case 'T':
			return 'TIMED-OUT';
			// studies_timed_out += 1;
			break;
		default:
			return 'UNKNOWN';
			break;
	}
}

function get_start(string, start, count){
	switch(string){
		case 'APPROVED':
		case 'REJECTED':
		case 'RETURNED':
			return start + count + 11;
			break;
		case 'TIMED-OUT':
			return start + count + 12;
			break;
		default:
			alert('Error, result is not as expected');
			return null;
	}
}