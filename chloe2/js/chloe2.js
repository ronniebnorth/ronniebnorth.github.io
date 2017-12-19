const chromatic = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];
const chromatic_labels = ['A','B♭','B','C','D♭','D','E♭','E','F','G♭','G','A♭'];

const octatonic = [1,1,1,1,1,1,1,0,0,0,0];
const heptatonic = [1,1,1,1,1,1,0,0,0,0,0];
const hexatonic = [1,1,1,1,1,0,0,0,0,0,0];
const pentatonic = [1,1,1,1,0,0,0,0,0,0,0];
const tetratonic = [1,1,1,0,0,0,0,0,0,0,0];
const tritonic = [1,1,0,0,0,0,0,0,0,0,0];

let octatonicScales = [];
let heptatonicScales = [];
let hexatonicScales = [];
let pentatonicScales = [];
let tetratonicScales = [];
let tritonicScales = [];

let lastVelocity = 100;
let lastGroup = "";

let clickedNote = "";
let inNote = false;
let viewNotes = "";

$(function() {
    $('body').on('mousedown', '.btn_key', function() {playKey($(this));});

    $('body').on('click', '.spn_key', function() {viewScale($(this));});

    $('body').on('click', '#closeModal', function() {$("#scaleViewModal").hide();});

    $('body').on('click', '.closeModal2', function() {$("#helpModal").hide();});

    $('body').on('click', '#helpLabel', function() {$("#helpModal").show();});

    $('body').on('keyup', '#mode_filter', function() {filterScales();});

    $('body').on('click', '#rotateMode', function(){rotateScaleViewRoot();});

    run();
});


function run(){
    octatonicScales.group = 'oct';
    heptatonicScales.group = 'hep';
    hexatonicScales.group = 'hex';
    pentatonicScales.group = 'pen';
    tetratonicScales.group = 'tet';
    tritonicScales.group = 'tri';

    octatonicScales = tryScales(octatonicScales, octatonic);
    heptatonicScales = tryScales(heptatonicScales, heptatonic);
    hexatonicScales = tryScales(hexatonicScales, hexatonic);
    pentatonicScales = tryScales(pentatonicScales, pentatonic);
    tetratonicScales = tryScales(tetratonicScales, tetratonic);
    tritonicScales = tryScales(tritonicScales, tritonic);

    let canvas = document.getElementById("canvas");

    let ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;

    makeUI();

    initFilters();
}


function playKey(key){
    let rootNote = key.text().replace('♭','b');
    let mode = key.closest("div").attr('data');
    let notes = getNotes(rootNote, mode.split(","));
    playMode(rootNote, notes);
}


function viewScale(spn){
    let spnTxt = spn.text();
    let binStr = spnTxt.substring(0,12);
    //$("#canvas").empty();
    let newlabels = clone(chromatic_labels);
    //$("#canvas").attr('note_labels', newlabels.join(","));
    $("#modeInfo").text(spnTxt);
    let divColor = spn.closest("div").css("background-color");
    //$("#canvas").attr('div_color',divColor);
    viewNotes = binStr;

    loadMode(binStr.split(""), newlabels, divColor);    
}


function filterScales(){
    let input = $("#mode_filter").val();
    if (history.pushState) {
        let newurl = window.location.protocol + "//" 
            + window.location.host + window.location.pathname + '?filter=' + input;
        window.history.pushState({path:newurl},'',newurl);
    }
    if(input === ""){
        $('.mdv').show();
        $('.spacer').show();
        return;
    }
    let inputArr = input.split(",");
    
    $(".spn_key").each(function(index){
        let found = false;
        for(let i = 0; i < inputArr.length; i++){
            if(inputArr[i].length > 0 && $(this).text().indexOf(inputArr[i]) !== -1){
                found = true;
                break;
            }
        }
        if(found){
            $(this).closest("div")
                .show()
                .next(".spacer").show();
        }else{
            $(this).closest("div")
            .hide()
            .next(".spacer").hide();
        }
    });
}



function rotateScaleViewRoot(){
    let notes = $("#canvas").attr('notes').split("");
    let labels = $("#canvas").attr('note_labels').split(",");
    let divColor = $("#canvas").attr('div_color');
    let newlabels = [];
    let mem = labels[0];
    for(let i = 1; i < labels.length; i++){
        newlabels.push(labels[i]);
    }
    newlabels.push(mem);
    $("#canvas").attr('note_labels', newlabels.join(","));
    loadMode(notes, newlabels, divColor);
}


function initFilters(){
    try{
    String.prototype.replaceAll = function(search, replacement) {
    var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    let parseQueryString = function(url) {
        let urlParams = {};
        url.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                urlParams[$1] = $3;
            }
        );
        return urlParams;
    }
    let urlToParse = location.search;  
    let result = parseQueryString(urlToParse );  
    let searchTerm = result.filter;
    searchTerm = searchTerm.replaceAll("%2C", ",");

        if(searchTerm.length > 1){
            $("#mode_filter").val(searchTerm);
            $("#mode_filter").keyup();
        }
    }catch(e){}
    return true;
}


function loadMode(notes, labels, divColor){
    viewNotes = labels;
    $("#canvas").remove();
    $("#scaleViewModalContent").append('<canvas div_color="' + divColor + '" modeInfo="" note_labels="' + labels + '" notes="' + notes.join("") + '" id="canvas" width="300" height="300" style="background-color:#000"></canvas>');
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");   
    radius = canvas.height / 2;
    ctx.translate(radius, radius);
    radius = radius * 0.90
    createScaleView(notes,labels,divColor);
    canvas.addEventListener("mousemove", on_mousemove, false);
    canvas.addEventListener("mousedown", on_click, false);
    $("#scaleViewModal").show();
}

function createScaleView(notes,labels,divColor) {
    drawFace(ctx, radius);
    drawNotes(ctx, radius, notes,labels,divColor);

}

function drawNotes(ctx, radius, notes, labels,divColor) {
    let ang;
    let num;
    ctx.font = radius*0.15 + "px arial";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    
    for(num= 0; num < 12; num++){
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius*0.85);
        ctx.rotate(-ang);

        if(num === 0){
           // ctx.beginPath();
          //  ctx.arc(0, 0, radius*0.12, 0, 2*Math.PI);
           // ctx.fillStyle = divColor;
           // ctx.fill();
        }
        if(notes[num] === '1'){
            ctx.beginPath();
            ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
            ctx.fillStyle = '#000';
            ctx.fill();
        }

        ctx.fillStyle = "white";
        if(num === 0){
            ctx.fillStyle = divColor;
         }
        if(notes[num] === '1'){ 
            
            ctx.fillText(labels[num], 0, 0); 

        }

        ctx.rotate(ang);
        ctx.translate(0, radius*0.85);
        ctx.rotate(-ang);
    }
    
    ctx.beginPath();
    ctx.moveTo(0, -100);

    if(notes[1] === "1"){
        ctx.lineTo(50, -85);
    }
    if(notes[2] === "1"){
        ctx.lineTo(85, -50);
    }   
    if(notes[3] === "1"){
        ctx.lineTo(100, 0);
    }  
    if(notes[4] === "1"){
        ctx.lineTo(85, 50);
    }  
    if(notes[5] === "1"){
        ctx.lineTo(50,85);
    }  
    if(notes[6] === "1"){
        ctx.lineTo(0,100);
    }  
    if(notes[7] === "1"){
        ctx.lineTo(-50, 85);
    }  
    if(notes[8] === "1"){
        ctx.lineTo(-85, 50);
    }  
    if(notes[9] === "1"){
        ctx.lineTo(-100, 0);
    }  
    if(notes[10] === "1"){
        ctx.lineTo(-85, -50);
    }  
    if(notes[11] === "1"){
        ctx.lineTo(-50,-85);
    }  

    ctx.lineTo(0, -100);
    ctx.fillStyle = divColor;
    ctx.fill();
    
}

function drawFace(ctx, radius) {
    let grad;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
/*
    grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.017;
    ctx.stroke();
*/
}


function playMode(rootNote, notesArr, oct="X"){    

    notesArr = shuffle(notesArr);

    notesArr = randomlyRepeatNotes(notesArr);

    notesArr = randomlyReshuffle(notesArr);

    notesArr = randomlyShortenPhrase(notesArr);

    notesArr = randomlyPutHoles(notesArr);

    let instrumentName = "acoustic_guitar_nylon";

    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: instrumentName,
        onprogress: function(state, progress) {
            //console.log(state, progress);
        },
        onsuccess: function() {
            MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
            let notes = notesArr;
            let delayt = randomlyGoHalfTime();
            if($('input[name=play_style]:checked').val() == 'chord'){
                delayt = 0;
            }
            let delay = Array(notes.length).fill(delayt);
            let tmpdelay= 0;
            let ctxtime = MIDI.getContext().currentTime;
            let channel = 0;

            let velocity = lastVelocity;

            if(Math.floor(Math.random() * 3) === 1){
                velocity = Math.floor(Math.random() * 20 + 80);
                lastVelocity = velocity;
            }

            if(oct == "X"){
                rootNote = getRandomRootOctave(rootNote);
            }else{
                rootNote = rootNote + oct;
            }

            let rootNoteStr = MIDI.keyToNote[rootNote];

            if($('input[name=play_style]:checked').val() !== 'just_fills'){
                MIDI.noteOn(channel, rootNoteStr, velocity + 150,0);
            }
            

            if(delayt === .15){
                notes = randomlyDoubleNotes(notes);
            }
            
            if($('input[name=play_style]:checked').val() != 'root'){
                for(let i=0; i < notes.length; i++){
                    let chordIt = Math.floor(Math.random() * 3);
                    if(chordIt === 1){
                        //let chordIt2 = Math.floor(Math.random() * 3);
                        //if(chordIt2 === 1){
                        //    let harm2 = Math.floor(Math.random() * (notes.length - 1));
                        //    let harm3 = Math.floor(Math.random() * (notes.length - 1));
                        //    MIDI.chordOn(channel, [notes[i],notes[harm2],notes[harm3]], velocity, ctxtime+tmpdelay);
                        //}else{
                            let harm = Math.floor(Math.random() * (notes.length - 1));
                            MIDI.chordOn(channel, [notes[i],notes[harm]], velocity, ctxtime+tmpdelay);
                        //}
                    }else{
                        MIDI.noteOn(channel, notes[i], velocity, ctxtime+tmpdelay);
                    }
                    
                    tmpdelay = tmpdelay + delay[i]
                }
            }


        }
    });
}


function isClose(a,b){
    if(b < a-20 || b > a+20){
        return false;
    }
    return true;

}


function on_mousemove (ev) {
    /*
    var x, y;

    if (ev.layerX || ev.layerX == 0) { 
      x = ev.layerX;
      y = ev.layerY;
    }
    
    x -= 150;
    y -= 150;
    y -= document.documentElement.scrollTop;
    //console.log('scroll', document.documentElement.scrollTop);
    //console.log(x,y);

    if(isClose(0, x) && isClose(-115, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[0].replace('♭','b');
    }else if(isClose(60, x) && isClose(-100, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[1].replace('♭','b');     
    }else if(isClose(100, x) && isClose(-60, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[2].replace('♭','b');           
    }else if(isClose(115, x) && isClose(0, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[3].replace('♭','b');           
    }else if(isClose(100, x) && isClose(60, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[4].replace('♭','b');         
    }else if(isClose(60, x) && isClose(100, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[5].replace('♭','b');           
    }else if(isClose(0, x) && isClose(115, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[6].replace('♭','b');         
    }else if(isClose(-60, x) && isClose(100, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[7].replace('♭','b');           
    }else if(isClose(-100, x) && isClose(60, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[8].replace('♭','b');           
    }else if(isClose(-115, x) && isClose(0, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[9].replace('♭','b');          
    }else if(isClose(-100, x) && isClose(-60, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[10].replace('♭','b');           
    }else if(isClose(-60, x) && isClose(-100, y)){
        document.body.style.cursor = "pointer";
        inNote=true;
        clickedNote = viewNotes[11].replace('♭','b');           
    }else{
        document.body.style.cursor = "";
        inNote=false;      
        clickedNote = "";
    }

*/

  }
  
function on_click(ev) {
    var x, y;
    
        if (ev.layerX || ev.layerX == 0) { 
          x = ev.layerX;
          y = ev.layerY;
        }
        
        x -= 150;
        y -= 150;
        y -= document.documentElement.scrollTop;
        //console.log('scroll', document.documentElement.scrollTop);
        //console.log(x,y);
        let oct = '2';

        if(isClose(0, x) && isClose(-115, y)){
            inNote=true;
            clickedNote = viewNotes[0].replace('♭','b');

        }else if(isClose(60, x) && isClose(-100, y)){
            // if c - bump p

            inNote=true;
            clickedNote = viewNotes[1].replace('♭','b');  
            if(clickedNote.charAt(0) === 'C'){
                oct = '3';
            }   
        }else if(isClose(100, x) && isClose(-60, y)){
            // if c - or d flat bump up
            inNote=true;
            clickedNote = viewNotes[2].replace('♭','b');   
            if(clickedNote.charAt(0) === 'C' || clickedNote === 'Db'){
                oct = '3';
            }           
        }else if(isClose(115, x) && isClose(0, y)){
            // if c, d flat, or d
            inNote=true;
            clickedNote = viewNotes[3].replace('♭','b');   
            if(clickedNote.charAt(0) === 'C' || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }          
        }else if(isClose(100, x) && isClose(60, y)){
            // if c, d flat, d, or e flat
            inNote=true;
            clickedNote = viewNotes[4].replace('♭','b');      
            if(clickedNote.charAt(0) === 'C' || clickedNote.charAt(0) === 'D' || clickedNote === 'Eb'){
                oct = '3';
            }       
        }else if(isClose(60, x) && isClose(100, y)){
            // if c, d flat, d, eflat, e
            inNote=true;
            clickedNote = viewNotes[5].replace('♭','b');   
            if(clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }            
        }else if(isClose(0, x) && isClose(115, y)){
            //if c d flat d e flt e or f
            inNote=true;
            clickedNote = viewNotes[6].replace('♭','b');  
            if(clickedNote.charAt(0) === 'F' || clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }                          
        }else if(isClose(-60, x) && isClose(100, y)){
           
            inNote=true;
            clickedNote = viewNotes[7].replace('♭','b');       
            if(clickedNote === 'Gb' || clickedNote.charAt(0) === 'F' || clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }          
        }else if(isClose(-100, x) && isClose(60, y)){
            
            inNote=true;
            clickedNote = viewNotes[8].replace('♭','b');   
            if(clickedNote.charAt(0) === 'G' || clickedNote.charAt(0) === 'F' || clickedNote.charAt(0) === 'E'
             || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }           
        }else if(isClose(-115, x) && isClose(0, y)){
           
            inNote=true;
            clickedNote = viewNotes[9].replace('♭','b');   
            if(clickedNote === 'Ab' || clickedNote.charAt(0) === 'G' || clickedNote.charAt(0) === 'F' || 
            clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }          
        }else if(isClose(-100, x) && isClose(-60, y)){
           
            inNote=true;
            clickedNote = viewNotes[10].replace('♭','b');    
            if(clickedNote.charAt(0) === 'A' || clickedNote.charAt(0) === 'G' || clickedNote.charAt(0) === 'F' 
            || clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }          
        }else if(isClose(-60, x) && isClose(-100, y)){
            
            inNote=true;
            clickedNote = viewNotes[11].replace('♭','b');   
            if(clickedNote === 'Bb' || clickedNote.charAt(0) === 'G' || clickedNote.charAt(0) === 'F' || 
            clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D' || clickedNote.charAt(0) === 'A'){
                oct = '3';
            }           
        }else{

            inNote=false;      
            clickedNote = "";
        }

    if (inNote)  {

        playMode(clickedNote, [], oct);
      
    }
}

  

function multiDimensionalUnique(arr) {
    let uniques = [];
    let itemsFound = {};
    for(let i = 0, l = arr.length; i < l; i++) {
        let stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

function getNotes(rootNote, mode){
    let chrome = R.concat(chromatic, chromatic);
    let start = chrome.indexOf(rootNote);
    let notes = [];
    for(let i = 0; i < 13; i++){
        if(mode[i] === '1'){

            let key = chrome[start + i] + '4';
            let note = MIDI.keyToNote[key]
            notes.push(note);
        }
    }
    return notes;
}

function perc2color(perc) {
	let r, g, b = 0;
	if(perc < 50) {
		r = Math.round(5.1 * perc);
        g = 255;
        b = 128;
	}
	else {
		g = Math.round(510 - 5.10 * perc);
        r = 150;
        b = 255;
	}
	let h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}


function makeModeUI(modes, div){
    let colorPercent = 100;
    modes = multiDimensionalUnique(modes);
    div.append('<div class="spacer" style="height:8px"></div>');
    for(let i = 0; i < modes.length; i++){
        let mode = modes[i];
        let num  = parseInt(mode.join(""),2);
        num2 = num - 2050;
        num2 = num2 / 15;
        let bgcolor = perc2color(num2);
        if(lastGroup !== mode.group){
            lastGroup = mode.group;
            div.append('<div class="spacer" style="height:5px"></div>');
        }
        let newdiv = $('<div class="mdv" data="' + mode + '" style="background-color:' + bgcolor + '"></div>');
        div.append(newdiv);
        //parseInt(mode.join(""), 2).toString(12) + 
        newdiv.append('<span class="spn_key">' + mode.join("") + ' (' + num + ') ' + mode.group + '</span data=' + mode + '>')
        .append($('#notes_template_container').html());
    }
}

function makeUI(){
    let div = $("#scales_div");

    makeModeUI(getModes(octatonicScales), div);
    makeModeUI(getModes(heptatonicScales), div);
    makeModeUI(getModes(hexatonicScales), div);
    makeModeUI(getModes(pentatonicScales), div);
    makeModeUI(getModes(tetratonicScales), div);
    makeModeUI(getModes(tritonicScales), div);
    
}



function getModes(scales){
    let modes = [];
    scales.sort();

    for(let i = 0; i < scales.length; i++){
        let scale = scales[i];
        scale = R.concat(scale, scale);
        let newmodes = [];
       
        for(let j = 0; j < scale.length/2; j++){
            
            if(scale[j] === 1){
                let mode = [];
                mode.group = scales.group + '-' + (i + 1);
                for(let n = j; n < j + 12; n++){
                    mode.push(scale[n]);
                }
                newmodes.push(mode);
            }
        }
        newmodes.sort()

        modes = R.concat(modes, newmodes);
    }
    //modes.sort();

    return modes;
}



function tryScales(scalesArr, scalesTemplate){
    
    for(let i = 0; i < 5000; i++){
        
        let attempt = shuffle(scalesTemplate);
        attempt = R.concat([1], attempt);
        attemptDoubled = R.concat(attempt,attempt);

        if(checkScale(attemptDoubled)){
            let worked = true;
            for(let j = 0; j < scalesArr.length; j++){
                let strScale = scalesArr[j].join("");
                strScale += strScale;
                let strAttempt = attempt.join("");
                if(strScale.indexOf(strAttempt) !== -1){
                    if(scalesArr[j] > attempt){
                        scalesArr[j] = attempt;
                    }
                    worked = false;
                }
            }
            if(worked){
                scalesArr.push(attempt);
            }
        }
    }

    return scalesArr;
}


function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
}

function checkScale(scale){
    for(let i = 0; i < scale.length; i++){
        if(scale[i] === 1 && scale[i+1] === 1 && scale[i+2] === 1){
            return false;
        }
    }
    return true;
}


function fillModes(){
    for(let i = 0; i < scales.length; i++){
        let scale = scales[i];
        let notesPerOctave = scale.notesPerOctave;
        let notes = [];
        for(let j = 0; j < notesPerOctave; j++){

        }
    }
}        


function randomlyRepeatNotes(notesArr){
    notesArr = clone(notesArr);
    let loopTimes = Math.floor(Math.random() * (notesArr.length));
    for(let lp = 0; lp < loopTimes; lp++){
        let randomNote = Math.floor(Math.random() * (notesArr.length - 1));
        notesArr[randomNote + 1] = notesArr[randomNote];
    }
    return notesArr;
}

function randomlyReshuffle(notesArr){
    notesArr = clone(notesArr);
    let reshuf = Math.floor(Math.random() * 2);
    
    if(reshuf === 1){
        notesArr = shuffle(notesArr);
    }
    return notesArr;
}

function randomlyShortenPhrase(notesArr){
    notesArr = clone(notesArr);
    let doStrip =  Math.floor(Math.random() * 3);
    if(doStrip === 1){
        let stripEnd = Math.floor(Math.random() * (notesArr.length - 1));
        while(stripEnd > 0){
            notesArr.pop();
            stripEnd--;
        }
    }
    return notesArr;
}

function randomlyPutHoles(notesArr){
    notesArr = clone(notesArr);
    let putHoles = Math.floor(Math.random() * 4);
    if(putHoles === 1 || putHoles === 2 || putHoles === 3){
        let numHoles = Math.floor(Math.random() * (notesArr.length - 3));
        numHoles = numHoles + 2;
        while(numHoles > 0){
            let pHole = Math.floor(Math.random() * (notesArr.length - 1));
            notesArr[pHole] = 0;
            numHoles--;
        }           
    }
    return notesArr;
}

function randomlyGoHalfTime(){      
    let mydelayT = Math.floor(Math.random() * 2);
    let delayt = .3;
    if(mydelayT === 1){
        delayt = .15;
    }
    return delayt;
}

function getRandomRootOctave(note){
    let rootOctR = Math.floor(Math.random() * 3);
    if(rootOctR === 1){
        return note + '2';
    }else{
        return note + '1';
    }
}

function randomlyDoubleNotes(notes){
    let connotes = clone(notes);
    if(Math.floor(Math.random() * 3) === 1){
        connotes.reverse();
    }else if(Math.floor(Math.random() * 3) === 2){
        connotes = shuffle(connotes);
    }

    let bs = Math.floor(Math.random() * 3);
    if(bs === 0){
        notes = notes.concat(connotes);
    }
    return notes;
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}