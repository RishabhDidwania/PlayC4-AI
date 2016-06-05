/*
 * @author Weidi Zhang
 * @description Smart AI for PlayC4.com
 */

// settings
var myColor = "red";
var useRandomTimeouts = false; // false for instant moves

// return type: void
function doMove(myColor) {
	var enemyColor = "blue";
	if (myColor == "blue") {
		enemyColor = "red";
	}
	
	/* the combinations are copy pasted from the site's check_for_winner method */
	var combinations = "0-1-2-3|1-2-3-4|2-3-4-5|3-4-5-6|7-8-9-10|8-9-10-11|9-10-11-12|10-11-12-13|14-15-16-17|15-16-17-18|16-17-18-19|17-18-19-20|21-22-23-24|" +
			"22-23-24-25|23-24-25-26|24-25-26-27|28-29-30-31|29-30-31-32|30-31-32-33|31-32-33-34|35-36-37-38|36-37-38-39|37-38-39-40|38-39-40-41|0-7-14-21|7-14-21-28|" +
			"14-21-28-35|1-8-15-22|8-15-22-29|15-22-29-36|2-9-16-23|9-16-23-30|16-23-30-37|3-10-17-24|10-17-24-31|17-24-31-38|4-11-18-25|11-18-25-32|18-25-32-39|" +
			"5-12-19-26|12-19-26-33|19-26-33-40|6-13-20-27|13-20-27-34|20-27-34-41|14-22-30-38|7-15-23-31|15-23-31-39|0-8-16-24|8-16-24-32|16-24-32-40|1-9-17-25|" +
			"9-17-25-33|17-25-33-41|2-10-18-26|10-18-26-34|3-11-19-27|20-23-32-38|13-19-25-31|19-25-31-37|6-12-18-24|12-18-24-30|18-24-30-36|5-11-17-23|" +
			"11-17-23-29|17-23-29-35|4-10-16-22|10-16-22-28|3-9-15-21";
			
	var combo = combinations.split("|");
	
	var myBestMove = findBestMove(combo, myColor);
	
	if (myBestMove > -1) {
		makeMoveForSlot(myBestMove);
	}
	else {		
		var enemyBestMove = findBestMove(combo, enemyColor);
		if (enemyBestMove > -1) {
			makeMoveForSlot(enemyBestMove);
		}
		else {
			var cols = ["one", "two", "three", "four", "five", "six", "seven"];
			var randCol = cols[Math.floor(Math.random() * cols.length)];
			
			console.log("Making move in column: " + randCol + " (random)");
			makeMove(randCol);
		}
	}
}

// return type: boolean
function moveBelongsTo(color, location) {
	return $("div.spaces div").eq(location).hasClass(color);
}

// return type: boolean
function moveNotTaken(location) {
	return !moveBelongsTo("red", location) && !moveBelongsTo("blue", location);
}

// return type: boolean
function moveTaken(location) {
	return moveBelongsTo("red", location) || moveBelongsTo("blue", location);
}

// return type: int
function findBestMove(combo, myColor) {
	for (var i = 0; i < combo.length; i++) {
		var values = combo[i].split("-");
		
		var missingMove = -1;
		var movesExisting = 0;
		for (var x = 0; x < values.length; x++) {
			var move = values[x];
		
			if (moveBelongsTo(myColor, move)) {
				movesExisting++;
			}
			else {
				missingMove = move;
			}
		}
		
		if (movesExisting == 3 && moveNotTaken(missingMove)) {
			var pieceBelow = parseInt(missingMove) + 7;
			
			console.log("Searching for color " + myColor + ", cominbation: " + values + ", piece below: " + pieceBelow);
				
			if (moveTaken(pieceBelow) || pieceBelow >= 42 /* exceeds board */) {
				return missingMove;
			}
		}
	}
	
	return -1;
}

// return type: void
function makeMoveForSlot(slot) {
	var col = $("div.spaces div").eq(slot).attr("class").split(" ")[0];
	
	console.log("Making move in column: " + col + " (found), move in question: " + slot);
	makeMove(col);
}

// return type: void
function makeMove(col) {
	if ($("#game_over").children()[0].innerHTML.indexOf("Wins") > -1) {
		console.log("Game has ended");
	}
	else if (movePossible(col)) {
		if (useRandomTimeouts) {
			var randTimeout = randomIntFromInterval(2000, 10000);
			
			console.log("Waiting " + randTimeout + "ms");
			setTimeout(function() {
				send_data(col);
			}, randTimeout);
		}
		else {
			send_data(col);
		}
	}
	else {
		console.log("Finding new move, previous move not possible - column full");
		doMove(myColor);
	}
}

function movePossible(col) {
	if (col == "one") {
		return moveNotTaken(0);
	}
	else if (col == "two") {
		return moveNotTaken(1);
	}
	else if (col == "three") {
		return moveNotTaken(2);
	}
	else if (col == "four") {
		return moveNotTaken(3);
	}
	else if (col == "five") {
		return moveNotTaken(4);
	}
	else if (col == "six") {
		return moveNotTaken(5);
	}
	else {
		return moveNotTaken(6);
	}
}

/* util */
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

/* auto move stuff below */

// override
function add_move(data) {
    var play = $("div.spaces div." + data.position).not('.played').last();
    if (data.role != "host") {
        $(play).html('<p class="blue"></p>');
        $(play).addClass('played blue');
    } else {
        $(play).html('<p class="red"></p>');
        $(play).addClass('played red');
    }
    check_for_winner();
	
	if (data.role != "host" && myColor == "red") {
		doMove(myColor);
	}
	else if (data.role == "host" && myColor == "blue") {
		doMove(myColor);
	}
}