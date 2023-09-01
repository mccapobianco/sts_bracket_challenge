var pools = {'A':[1,2,3,4], 'B':[1,2,3,4], 'C':[1,2,3,4], 'D':[1,2,3,4]};
const seed_slots = {'A1':'MT1', 'A2':'MT6', 'A3':'MB8', 'A4':'MB3',
                    'B1':'MT5', 'B2':'MT2', 'B3':'MB4', 'B4':'MB7',
                    'C1':'MT7', 'C2':'MT4', 'C3':'MB6', 'C4':'MB5',
                    'D1':'MT3', 'D2':'MT8', 'D3':'MB2', 'D4':'MB1'};
var bracket_matches = Object.fromEntries( [...Array(15).keys()].map( x => [x+1, null]) );;

function fill_bracket(){
    for (const [key, value] of Object.entries(seed_slots)){
        document.getElementById(value).innerHTML = document.getElementById(key).innerHTML;   
    }
}

function clear_path(button){
    var original_fontWeight = button.style.fontWeight;
    var match = parseInt(button.id.slice(2));
    var next_match = Math.ceil(match/2) + 8;
    if (match == 16){
        return;
    }
    var next_tb = match % 2 ? 'T' : 'B';
    var next_button = document.getElementById(`M${next_tb}${next_match}`);
    var next_filled = next_button.innerHTML.length > 0;
    if (next_filled){
        next_button.style.fontWeight = 400;
        next_button.innerHTML = '';
        bracket_matches[match] = null;
        clear_path(next_button);
    }
}

function bracket_onclick(button){
    if (button.innerHTML.length == 0){return}
    var original_fontWeight = button.style.fontWeight;
    button.style.fontWeight = 800;
    var tb = button.id.slice(1,2);
    var match = parseInt(button.id.slice(2));
    var opponent_button = document.getElementById(`M${tb=='T'?'B':'T'}${match}`);
    opponent_button.style.fontWeight = 400;
    bracket_matches[match] = tb == 'T' ? 1 : 0;
    var next_match = Math.ceil(match/2) + 8;
    var next_tb = match % 2 ? 'T' : 'B';
    var next_button = document.getElementById(`M${next_tb}${next_match}`);
    var next_filled = next_button.style.fontWeight == 800;
    if (next_filled && original_fontWeight!=800){
        clear_path(next_button);
    }
    next_button.innerHTML = button.innerHTML;
}

function pool_onclick(button){
    var pool = button.id.slice(0,1);
    var team = parseInt(button.id.slice(1,2));
    var dir = button.id.slice(2,3);
    var sign = dir == 'u' ? 1 : -1;
    var swap_team = team - sign;
    var temp = document.getElementById(pool+swap_team).innerHTML;
    document.getElementById(pool+swap_team).innerHTML = document.getElementById(pool+team).innerHTML;
    var bracket_spot_swap = document.getElementById(seed_slots[pool+swap_team]);
    if (bracket_spot_swap.style.fontWeight == 800){
        clear_path(bracket_spot_swap);
        bracket_spot_swap.style.fontWeight = 400;
    }
    bracket_spot_swap.innerHTML = document.getElementById(pool+team).innerHTML;
    document.getElementById(pool+team).innerHTML = temp;
    var bracket_spot = document.getElementById(seed_slots[pool+team]);
    if (bracket_spot.style.fontWeight == 800){
        clear_path(bracket_spot);
        bracket_spot.style.fontWeight = 400;
    }
    bracket_spot.innerHTML = temp;
    
    temp = pools[pool][swap_team-1];
    pools[pool][swap_team-1] = pools[pool][team-1];
    pools[pool][team-1] = temp;

}

function submit_onclick(){
    var name = document.getElementById('submission_name').value;
    if (name.trim().length == 0){
        window.alert('Submission needs a name.');
        return;
    }
    if (Object.values(bracket_matches).includes(null)){
        window.alert('All matchups must be decided before submitting.');
        return;
    }
    var encoded_sub = encode_submission(pools, bracket_matches);
    var url = `https://docs.google.com/forms/d/e/1FAIpQLSf0gQz7wwTJ82u2bFgm4My3Bp1_uyPAS5cMRKp6BU4JGmUErw/formResponse?submit=Submit?usp=pp_url&entry.981223668=${name}&entry.84234487=${encoded_sub}`;
    url = encodeURI(url);
    $.post(url)
    window.alert('Done. View the leaderboard to ensure your bracket has been submitted properly.')
}

function encode_submission(pools, bracket){
    var bit_string = '';
    for (var i='A'.charCodeAt(0); i<='D'.charCodeAt(0); i++){
        var pool = pools[String.fromCharCode(i)];
        bit_string += (pool[0]-1).toString(2).padStart(2, '0');
        bit_string += (pool[1]-1).toString(2).padStart(2, '0');
        bit_string += pool[2] > pool[3] ? '1' : '0';
    }
    for (var i=1; i<=15; i++){
        bit_string += bracket[i];
    }
    bit_string = bit_string.padStart(36, '0');
    var output = '';
    for (var i=0; i<bit_string.length; i+=6){
        output += String.fromCharCode(parseInt(bit_string.slice(i, i+6), 2) + 48);
    }
    return output
}

function onload(){
    fill_bracket();
}
