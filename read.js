const reader = new FileReader()

function read(input) {
	const csv = input.files[0]
	reader.readAsText(csv)
}

let studies = [], study_dataset = [], study_labels = [], container = [];

reader.onload = function (e) {

	let ignore_commas = false;
	let container = [];
	let highest_bonus = 0, highest_payout = 0, studies_timed_out = 0,
		studies_returned = 0, studies_rejected = 0, studies_approved = 0;
	let selector = 0, start = 67, count = 0;
	let long_string = e.target.result;
	let year = 1;
	let month = 1;
	let day = 1;

	// go through the entire .csv file and update the studies array if the study is approved, functionality can be changed
	while (start != long_string.length) {
		ignore_commas = check_for_double_quotes(ignore_commas, long_string, start, count);
		if (long_string.charAt(start + count) == ',' && !ignore_commas) {
			switch (selector) {
				case 0:
					// study name
					container[0] = long_string.substr(start, count);
					break;
				case 1:
					// study pay
					container[1] = long_string.substr(start, count);
					container[1] = container[1].substr(1, container[1].length - 1);
					//container[1] = Math.trunc(+container[1].trim() * 100);
					container[1] = +container[1].trim();
					//console.log(container[1]);
					// todo - possibly record the total amount of payout for studies in a month,
					// append it to the start/end of the year and months array
					break;
				case 2:
					// study bonus
					container[2] = long_string.substr(start, count);
					container[2] = container[2].substr(1, container[2].length - 1);
					//console.log("string is: " + container[2]);
					//container[2] = Math.trunc(+container[2].trim() * 100);
					container[2] = +container[2].trim();
					//console.log("int is: " + container[2]);
					break;
				case 3:
					// study start date
					container[3] = long_string.substr(start + count);
					day = long_string.substr(start + 8, 2) * 1;
					year = long_string.substr(start, 4) * 1;
					month = long_string.substr(start + 5, 2) * 1;
					break;
				case 4:
					// study end date
					container[4] = long_string.substr(start, count);
					break;
				case 5:
					container[5] = long_string.substr(start, count);
					switch (long_string.charAt(start + count + 1)) {
						case 'A':
							container[6] = 'APPROVED';
							start = start + count + 11;
							highest_payout = check_for_highest_payout(highest_payout, container[1]);
							highest_bonus = check_for_highest_bonus(highest_bonus, container[2]);
							studies_approved += 1;
							break;
						case 'R':
							if (long_string.charAt(start + count + 3) == 'J') {
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

					// only record the study if it was actually approved
					if (container[6] == 'APPROVED') {
						studies = update_studies(studies, container, year, month, day);
					}

					break;
				default:
					alert('Something has gone wrong with the selector');
					break;
			}

			// reset the selector to start recording the name of the next study, or advance a selector
			if (selector == 5) {
				selector = 0;
				container = [];
			} else {
				selector += 1;
				start = start + count + 1;
			}

			count = 0;
		} else {
			// advance a character in the .csv file
			count += 1;
		}
	}

	// sort all the month arrays in descending order so the data is shown in order

	let temp_month = [];
	let temp_month_num = 0;
	let temp_month_pay = 0;
	let temp_month_bonus = 0;

	for (i = 0; i < studies.length; i++) {
		for (j = 1; j < studies[i].length; j++) {
			temp_month = studies[i][j];
			temp_month_num = temp_month.shift();
			temp_month_pay = temp_month.shift();
			temp_month_bonus = temp_month.shift();
			temp_month.sort((a, b) => {
				return a[0] - b[0];
			});
			temp_month.unshift(temp_month_bonus);
			temp_month.unshift(temp_month_pay);
			temp_month.unshift(temp_month_num);
			studies[i][j] = temp_month;
		}
	}

	// for debugging
	// console.log(studies);

	// create options for the HTML select element
	let study_day_count = 0;
	let option = null;

	for (i = 0; i < studies.length; i++) {
		option = document.createElement("option");
		option.text = studies[i][0];
		option.value = "" + studies[i][0];
		document.getElementById("year_selector").append(option);
		for (j = 1; j < studies[i].length; j++) {
			for (k = 3; k < studies[i][j].length; k++) {
				study_day_count = studies[i][j][k][1];
				study_labels.push(studies[i][0] + "-" + studies[i][j][0] + "-" + studies[i][j][k][0]);
				study_dataset.push(study_day_count);
			}
		}
	}

	// load the graph fully
	reloadGraph(0, 0, 1);

	// display stats and remove helper button
	let node = document.getElementsByClassName('toggle_helper');
	node[0].style.visibility = 'hidden';
	node = document.getElementsByClassName('container');
	node[0].style.display = 'block';


	pie_dataset = [studies_approved, studies_returned, studies_rejected, studies_timed_out];
	bar_dataset = [highest_payout / 100, highest_bonus / 100];

	load_pie(pie_dataset);
	load_bar(bar_dataset);
}

function check_for_double_quotes(bool, str, start, count) {
	// if there's a double quote, ignore commas until finding another double quote
	if (str.charAt(start + count) == "\"") {
		bool = !bool;
	}
	return bool;
}

function check_for_highest_payout(highest_payout, current_payout) {
	if (current_payout > highest_payout) {
		highest_payout = current_payout;
	}
	return highest_payout;
}

function check_for_highest_bonus(highest_bonus, current_bonus) {
	if (current_bonus > highest_bonus) {
		highest_bonus = current_bonus;
	}
	return highest_bonus;
}

function update_studies(studies, container, year, month, day) {
	if (studies[0] == null) {
		// if it's the first study, create the first year array, populate it with months
		// then increment the day of the study. otherwise check the array for a match

		studies.push([year, [01, 0, 0], [02, 0, 0], [03, 0, 0], [04, 0, 0], [05, 0, 0], [06, 0, 0], [07, 0, 0], [08, 0, 0], [09, 0, 0], [10, 0, 0], [11, 0, 0], [12, 0, 0]]);

		for (i = 1; i < studies[0].length; i++) {
			if (studies[0][i][0] == month) {
				studies[0][i].push([day, 1]);
			}
		}

	} else {
		let year_match = false;
		let day_match = false;

		// check for year first
		for (i = 0; i < studies.length; i++) {
			if (studies[i][0] == year) {
				// if year is a match, check the month
				year_match = true;
				for (j = 1; j < studies[i].length; j++) {
					//console.log("entering month check loop");
					if (studies[i][j][0] == month) {
						// if month is a match, check the day
						for (k = 3; k < studies[i][j].length; k++) {
							if (studies[i][j][k][0] == day) {
								day_match = true;
								studies[i][j][k][1] = studies[i][j][k][1] + 1;
								studies[i][j][1] = studies[i][j][1] + container[1];
								studies[i][j][2] = studies[i][j][2] + container[2];
							}
						}
						if (!day_match) {
							studies[i][j].push([day, 1]);
							studies[i][j][1] = studies[i][j][1] + container[1];
							studies[i][j][2] = studies[i][j][2] + container[2];
						}
					} // no need to push a new month because they're all already there
				}
			}
		}
		if (!year_match) {
			studies.push([year, [01, 0, 0], [02, 0, 0], [03, 0, 0], [04, 0, 0], [05, 0, 0], [06, 0, 0], [07, 0, 0], [08, 0, 0], [09, 0, 0], [10, 0, 0], [11, 0, 0], [12, 0, 0]]);

			for (i = 1; i < studies.length; i++) {
				if (studies[i][0] == year) {
					for (j = 1; j < studies[i].length; j++) {
						if (studies[i][j][0] == month) {
							studies[i][j].push([day, 1]);
							studies[i][j][1] = studies[i][j][1] + container[1];
							studies[i][j][2] = studies[i][j][2] + container[2];
						}
					}
				}
			}
		}
	}
	return studies;
}

function toggle_helper() {
	let node = document.getElementsByClassName('helper');
	let visibility = node[0].style.visibility;
	node[0].style.visibility = visibility == "visible" ? 'hidden' : "visible";
}

function reloadGraph(year, month, full) {
	// load a new labels and dataset array, then load a graph of them
	let div = document.getElementsByClassName("pay_and_count");
	div[0].innerHTML = "";
	study_labels = [];
	study_dataset = [];
	let pay = 0;
	let bonus = 0;
	let count = 0;

	if (year) {
		console.log("year flag is true, year is " + year);
		for (i = 0; i < studies.length; i++) {
			if (studies[i][0] == year) {
				if (month) {
					console.log("month flag is true, month is " + month);
					for (j = 1; j < studies[i].length; j++) {
						if (studies[i][j][0] == month) {
							console.log("matched month. " + studies[i][j][0] + " and " + month);
							pay = studies[i][j][1];
							bonus = studies[i][j][2];
							for (k = 3; k < studies[i][j].length; k++) {
								study_labels.push(year + "-" + month + "-" + studies[i][j][k][0]);
								study_dataset.push(studies[i][j][k][1]);
								count = count + studies[i][j][k][1];
							}
						}

					}
				} else {
					console.log("month flag false, getting all studies for year: " + year);
					for (j = 1; j < studies[i].length; j++) {
						//month = studies[i][j][0];
						pay = pay + studies[i][j][1];
						bonus = bonus + studies[i][j][2];
						for (k = 3; k < studies[i][j].length; k++) {
							study_labels.push(year + "-" + studies[i][j][0] + "-" + studies[i][j][k][0]);
							study_dataset.push(studies[i][j][k][1]);
							count = count + studies[i][j][k][1];
						}
					}
				}
			}
		}
	} else if (full) {
		console.log("full flag true, getting all studies from all years");
		for (i = 0; i < studies.length; i++) {
			for (j = 1; j < studies[i].length; j++) {
				pay = pay + studies[i][j][1];
				bonus = bonus + studies[i][j][2];
				for (k = 3; k < studies[i][j].length; k++) {
					study_labels.push(studies[i][0] + "-" + studies[i][j][0] + "-" + studies[i][j][k][0]);
					study_dataset.push(studies[i][j][k][1]);
					count = count + studies[i][j][k][1];
				}
			}
		}
	}

	load_graph(study_labels, study_dataset);

	pay = +pay.toFixed(2);
	bonus = +bonus.toFixed(2);

	let total = (pay + bonus).toFixed(2);

	console.log("month: " + month + ", year: " + year + ", full : " + full);
	if (month && year) {
		switch (month) {
			case 1:
				month = "January";
				break;
			case 2:
				month = "February";
				break;
			case 3:
				month = "March";
				break;
			case 4:
				month = "April";
				break;
			case 5:
				month = "May";
				break;
			case 6:
				month = "June";
				break;
			case 7:
				month = "July";
				break;
			case 8:
				month = "August";
				break;
			case 9:
				month = "September";
				break;
			case 10:
				month = "October";
				break;
			case 11:
				month = "November";
				break;
			case 12:
				month = "December";
				break;
			default:
				console.log("Something went wrong getting the month...");
				break;
		}
		if (count == 1) {
			div[0].append(`In ${month} ${year}, you completed ${count} study and earned £${total}, of which £${bonus} was bonus payment.`);
		} else {
			div[0].append(`In ${month} ${year}, you completed ${count} studies and earned £${total}, of which £${bonus} was bonus payment.`);
		}
	} else if (year && !month) {
		if (count == 1) {
			div[0].append(`In ${year}, you completed ${count} study and earned £${total}, , of which £${bonus} was bonus payment.`);
		} else {
			div[0].append(`In ${year}, you completed ${count} studies and earned £${total}, of which £${bonus} was bonus payment.`);
		}
	} else if (full && !month && !year) {
		if (count == 1) {
			div[0].append(`In total, you completed ${count} study and earned £${total}, of which £${bonus} was bonus payment.`);
		} else {
			div[0].append(`In total, you completed ${count} studies and earned £${total}, of which £${bonus} was bonus payment.`);
		}
	}

	// TODO add bonus to the total amount earned for the period, would have to add container[2] as another index in each month array
	// would have to change the starting index of 2 to 3, and unshift and shift a third time in the sorting algo
}

function check() {
	// take the value of the month/year selector and pass them as arguments
	// to reloadGraph like reloadGraph(2020, 1, 0)
	let m = document.getElementById("month_selector");
	let y = document.getElementById("year_selector");
	let month = m.options[m.selectedIndex].value * 1;
	let year = y.options[y.selectedIndex].value * 1;
	console.log("month: " + month + " y: " + year);
	reloadGraph(year, month, 0);
}

