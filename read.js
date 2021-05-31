const reader = new FileReader()
let highest_bonus = 0;
let highest_payout = 0;
let studies = [];
let selector = 0;
let start = 67;
let count = 0;
let studies_array_iter = 0;
let double_quotes = 0;
let ignore_commas = false;
let study_name = "";
let study_pay = "";
let study_bonus = "";
let study_start = "";
let study_finish = "";
let study_code = "";
let study_result = "";
let studies_rejected = 0;
let studies_timed_out = 0;
let studies_returned = 0;

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

reader.onload = function (e) {
    let long_string = e.target.result;
	while(start != long_string.length){
		if(long_string.charAt(start + count) == "\""){
			console.log("Found a double quote");
			ignore_commas = !ignore_commas;
		}
		if(long_string.charAt(start + count) == ',' && !ignore_commas){
			// console.log('comma found');
			if(selector == 5){
				// console.log('Selector is 5...');
				study_code = long_string.substr(start, count);
				switch(long_string.charAt(start + count + 1)){
					case 'A': 
						study_result = 'APPROVED';
						start = start + count + 11;
						if(study_pay > highest_payout){
							highest_payout = study_pay;
						}
						if(study_bonus > highest_bonus){
							highest_bonus = study_bonus;
						}
						break;
					case 'R':
						if(long_string.charAt(start + count + 3) == 'J'){
							study_result = 'REJECTED';
							studies_rejected += 1;
						} else {
							study_result = 'RETURNED';
							studies_returned += 1;
						}
						start = start + count + 11;
						break;
					case 'T':
						study_result = 'TIMED-OUT';
						start = start + count + 12;
						studies_timed_out += 1;
						break;
					default:
						break;
				}
				studies.push([study_name, study_pay, study_bonus, study_start, study_finish,
				study_code, study_result]);
				// console.log('console logging array contents...');
				count = studies.length - 1;
				console.log(studies[count]);
				count = 0;
				selector = 0;
			} else {
				switch(selector){
					case 0:
						study_name = long_string.substr(start, count);
						break;
					case 1:
						study_pay = long_string.substr(start, count);
						study_pay = study_pay.substr(1, study_pay.length - 1);
						study_pay = +study_pay.trim() * 100;
						break;
					case 2:
						study_bonus = long_string.substr(start, count);
						study_bonus = study_bonus.substr(1, study_bonus.length - 1);
						study_bonus = +study_bonus * 100;
						break;
					case 3:
						study_start = long_string.substr(start, count);
						break;
					case 4:
						study_finish = long_string.substr(start, count);
						break;
					default:
						break;
				}
				selector += 1;
				start = start + count + 1;
				count = 0;
			}
		} else {
			count +=1;
		}
	}
	document.querySelector('.output').innerText = `Highest payout = ${highest_payout / 100},
	 Highest bonus = ${highest_bonus / 100},
	 Studies returned = ${studies_returned},
	 Studies rejected by researcher = ${studies_rejected},
	 Studies timed out of = ${studies_timed_out}`;
}

/* 67 is the index of the first character of the first study
ideas for making it work - check string char by char for a comma, 
incrementing a counter as we go, once a comma is found get the substr
of the previous index (should be right after last comma) and the counter
to successfully take the value from line, then repeat 
0-name
1-pay
2-bonus
3-date start
4-date end
5-code
6-result
after getting code, check first char of approve/reject/time out for easy count increment
*/

// debug thingies
// put this somewhere to know state of variables
// console.log(`Selector: ${selector}, start: ${start});