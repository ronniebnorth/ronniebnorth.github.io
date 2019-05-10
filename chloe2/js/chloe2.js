const chromatic = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];
const chromatic_labels = ['A','B♭','B','C','D♭','D','E♭','E','F','G♭','G','A♭'];

let octatonicScales = [];
let heptatonicScales = [];
let hexatonicScales = [];
let pentatonicScales = [];
let tetratonicScales = [];
let tritonicScales = [];

let lastVelocity = 90;
let lastGroup = '';

let clickedNote = '';
let inNote = false;
let viewNotes = '';
let stuckButton = false;

let instrumentName = 'acoustic_grand_piano';

let bpm = 50;
let tempo = 60000 / (bpm / 4);
tempo = Math.round(tempo);
//let tempo = 3000; //2400;

//'dulcimer' //metallic pipes
//'celesta'; //robotic
//'acoustic_grand_piano';
//'honkytonk_piano';
//'xylophone';
//let instrumentName = 'acoustic_guitar_nylon';

let timeOut = false;

let firstLoad = true;

document.addEventListener('DOMContentLoaded', function () {
    loadMidi(instrumentName);

    document.body.addEventListener('click', function (evt) {
        const classList = evt.target.classList;
        if (classList.contains('instrument_name')) {
            loadMidi(evt.target.value);
        } else if (classList.contains('spn_key')) {
            viewScale(evt.target);
        } else if (classList.contains('closeModal2')) {
            document.getElementById('helpModal').style.display = 'none';
        }
    }, false);

    document.body.addEventListener('mousedown', function (evt) {
        const classList = evt.target.classList;
        if (classList.contains('btn_key')) { //did use mousedown for some reason
            keyPress(evt.target);
        }
    }, false);

    document.getElementById('closeModal').addEventListener('click', function (evt) {
        document.getElementById('scaleViewModal').style.display = 'none';
    }, false);
    document.getElementById('helpLabel').addEventListener('click', function (evt) {
        document.getElementById('helpModal').style.display = 'block';
    }, false);
    document.getElementById('lbl_mode_filter').addEventListener('click', function (evt) {
        let clear = true;
        filterScales(clear);
    }, false);
    document.getElementById('rotateMode').addEventListener('click', function (evt) {
        rotateScaleViewRoot();
    }, false);
    document.getElementById('mode_filter').addEventListener('keyup', function (evt) {
        filterScales(false);
    }, false);
});

const loadMidi = (instrumentName) => {
    MIDI.loadPlugin({
        soundfontUrl: './soundfont/',
        instrument: instrumentName,
        //instruments: [ 'acoustic_grand_piano', 'acoustic_guitar_nylon' ],
        //targetFormat: 'mp3',
        onprogress: function(state, progress) {
        },
        onsuccess: function() {
            MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
            /*MIDI.setEffects([
                {
                    type: 'MoogFilter',
                    bufferSize: 4096,
                    bypass: false,
                    cutoff: 0.065,
                    resonance: 3.5
                },
                {
                    type: 'Bitcrusher',
                    bits: 4,
                    bufferSize: 4096,
                    bypass: false,
                    normfreq: 0.1
                },
                {
                    type: 'Phaser',
                    rate: 1.2, // 0.01 to 8 is a decent range, but higher values are possible
                    depth: 0.3, // 0 to 1
                    feedback: 0.2, // 0 to 1+
                    stereoPhase: 30, // 0 to 180
                    baseModulationFrequency: 700, // 500 to 1500
                    bypass: 0
                }, {
                    type: 'Chorus',
                    rate: 1.5,
                    feedback: 1.2,
                    delay: 1.1045,
                    bypass: 0
                }, {
                    type: 'Delay',
                    feedback: 0.45, // 0 to 1+
                    delayTime: 150, // how many milliseconds should the wet signal be delayed? 
                    wetLevel: 0.25, // 0 to 1+
                    dryLevel: 1, // 0 to 1+
                    cutoff: 20, // cutoff frequency of the built in highpass-filter. 20 to 22050
                    bypass: 0
                }, {
                    type: 'Overdrive',
                    outputGain: 0.5, // 0 to 1+
                    drive: 0.7, // 0 to 1
                    curveAmount: 1, // 0 to 1
                    algorithmIndex: 0, // 0 to 5, selects one of our drive algorithms
                    bypass: 0
                }, {
                    type: 'Compressor',
                    threshold: 0.5, // -100 to 0
                    makeupGain: 1, // 0 and up
                    attack: 1, // 0 to 1000
                    release: 0, // 0 to 3000
                    ratio: 4, // 1 to 20
                    knee: 5, // 0 to 40
                    automakeup: true, // true/false
                    bypass: 0
                }, {
                    type: 'Convolver',
                    highCut: 22050, // 20 to 22050
                    lowCut: 20, // 20 to 22050
                    dryLevel: 1, // 0 to 1+
                    wetLevel: 1, // 0 to 1+
                    level: 1, // 0 to 1+, adjusts total output of both wet and dry
                    impulse: './inc/tuna/impulses/impulse_rev.wav', // the path to your impulse response
                    bypass: 0
                }, {
                    type: 'Filter',
                    frequency: 20, // 20 to 22050
                    Q: 1, // 0.001 to 100
                    gain: 0, // -40 to 40
                    bypass: 1, // 0 to 1+
                    filterType: 0 // 0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
                }, {
                    type: 'Cabinet',
                    makeupGain: 1, // 0 to 20
                    impulsePath: './inc/tuna/impulses/impulse_guitar.wav', // path to your speaker impulse
                    bypass: 0
                }, {
                    type: 'Tremolo',
                    intensity: 0.3, // 0 to 1
                    rate: 0.1, // 0.001 to 8
                    stereoPhase: 0, // 0 to 180
                    bypass: 0
                }, {
                    type: 'WahWah',
                    automode: true, // true/false
                    baseFrequency: 0.5, // 0 to 1
                    excursionOctaves: 2, // 1 to 6
                    sweep: 0.2, // 0 to 1
                    resonance: 10, // 1 to 100
                    sensitivity: 0.5, // -1 to 1
                    bypass: 0
                }
            ]);*/
            if(firstLoad){
                run();
            }
            firstLoad = false;      
        }
    });
}


const loopKey = () => {
    console.log('loopKey function');
    if(stuckButton !== false){
        playKey(stuckButton);
        timeOut = setTimeout(function () { loopKey(); }, tempo);
    }
}


const keyPress = (btn) => {
    console.log('keyPress function');

    if (stuckButton !== false) {
        stuckButton.classList.remove('blink');
        if (stuckButton.textContent === btn.textContent
            && stuckButton.closest('div').getAttribute('data') === btn.closest('div').getAttribute('data')) {
            stuckButton = false;
            return;
        }
        stuckButton = false;
    }
    stuckButton = btn;
    stuckButton.classList.add('blink');

    bpm = document.getElementById('bpm').value;
    bpm = bpm < 10 ? 10 : bpm;
    bpm = bpm > 200 ? 200 : bpm;

    tempo = 60000 / (bpm / 4);
    tempo = Math.round(tempo);
    const msecs = tempo;
    playKey(stuckButton);
    clearTimeout(timeOut);
    timeOut = setTimeout(function () { loopKey(); }, msecs);
}


const run = () => {
    octatonicScales.group = 'oct';
    heptatonicScales.group = 'hep';
    hexatonicScales.group = 'hex';
    pentatonicScales.group = 'pen';
    tetratonicScales.group = 'tet';
    tritonicScales.group = 'tri';

    octatonicScales = getScales(octatonicScales, 8);
    heptatonicScales = getScales(heptatonicScales, 7);
    hexatonicScales = getScales(hexatonicScales, 6);
    pentatonicScales = getScales(pentatonicScales, 5);
    tetratonicScales = getScales(tetratonicScales, 4);
    tritonicScales = getScales(tritonicScales, 3);

    makeUI();
    initFilters();
    document.getElementById('imgLoad').style.display = 'none';
}


const playKey = (key) => {
    console.log('playKey function');
    // bpm = document.getElementById('bpm').value;
    // bpm = bpm < 10 ? 10 : bpm;
    // bpm = bpm > 200 ? 200 : bpm;

    tempo = 60000 / (bpm / 4);
    tempo = Math.round(tempo);

    const rootNote = key.textContent.replace('♭', 'b');
    const mode = key.closest('div').getAttribute('data');
    const notes = getNotes(rootNote, mode.split(','));
    playMode(rootNote, notes);
}


const viewScale = (spn) => {
    const spnTxt = spn.textContent;
    const binStr = spnTxt.substring(0,12);
    const newlabels = clone(chromatic_labels);
    const divColor = spn.closest('div').style.backgroundColor; 
    viewNotes = binStr;
    document.getElementById('modeInfo').textContent = spnTxt;
    loadMode(binStr.split(''), newlabels, divColor);    
}


const filterScales = (clear) => {
    if(clear){
        document.getElementById('mode_filter').value = '';
    }
    const input = document.getElementById('mode_filter').value;
    if (history.pushState) {
        let newurl = window.location.protocol + '//' 
            + window.location.host + window.location.pathname + '?filter=' + input;
        window.history.pushState({path:newurl},'',newurl);
    }
    if (input === '') {
        document.querySelectorAll('.mdv').forEach(a => a.style.display = 'block');
        document.querySelectorAll('.spacer').forEach(a => a.style.display = 'block');
        document.getElementById('lbl_mode_filter').textContent = 'Filter';
        return;
    }else{
        document.getElementById('lbl_mode_filter').textContent = 'Clear';
    }
    const inputArr = input.split(',');

    //document.querySelectorAll('.spn_key').forEach(function (index) {
    $('.spn_key').each(function(index){
        let found = false;
        for(let i = 0; i < inputArr.length; i++){
            if(inputArr[i].length > 0 && $(this).text().indexOf(inputArr[i]) !== -1){
                found = true;
                break;
            }
        }
        if(found){
            $(this).closest('div')
                .show()
                .next('.spacer').show();
        }else{
            $(this).closest('div')
            .hide()
            .next('.spacer').hide();
        }
    });
}



const rotateScaleViewRoot = () => {
    const notes = document.getElementById('canvas').getAttribute('notes').split('');
    const labels = document.getElementById('canvas').getAttribute('note_labels').split(',');
    const divColor = document.getElementById('canvas').getAttribute('div_color');

    const newlabels = [];
    const mem = labels[0];
    for(let i = 1; i < labels.length; i++){
        newlabels.push(labels[i]);
    }
    newlabels.push(mem);
    document.getElementById('canvas').setAttribute('note_labels', newlabels.join(','));
    loadMode(notes, newlabels, divColor);
}


const initFilters = () => {
    try{
        String.prototype.replaceAll = function(search, replacement) {
            let target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        const parseQueryString = (url) => {
            let urlParams = {};
            url.replace(
                new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
                function($0, $1, $2, $3) {
                    urlParams[$1] = $3;
                }
            );
            return urlParams;
        }
        const urlToParse = location.search;  
        const result = parseQueryString(urlToParse );
            
        let searchTerm = result.filter;
            
        searchTerm = searchTerm.replaceAll('%2C', ',');
       
        if (searchTerm.length > 1) {
            document.getElementById('mode_filter').value = searchTerm;
            filterScales(false);
        }
    }catch(e){}
    return true;
}


const loadMode = (notes, labels, divColor) => {
    viewNotes = labels;
    document.getElementById('canvas').remove();
    let wrapper = document.createElement('div');
    wrapper.innerHTML = '<canvas div_color="' + divColor + '" modeInfo="" note_labels="' + labels
        + '" notes="' + notes.join("") + '" id="canvas" width="300" height="300" style="background-color:#000"></canvas>';
    let div = wrapper.firstChild;
    document.getElementById('scaleViewModalContent').appendChild(div);
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');   
    radius = canvas.height / 2;
    ctx.translate(radius, radius);
    radius = radius * 0.90
    createScaleView(notes,labels,divColor);
    canvas.addEventListener('mousedown', on_click, false);
    document.getElementById('scaleViewModal').style.display = 'block';
}

const createScaleView = (notes,labels,divColor) => {
    drawFace(ctx, radius);
    drawNotes(ctx, radius, notes,labels,divColor);

}

const drawNotes = (ctx, radius, notes, labels,divColor) => {
    let ang;
    let num;
    
    ctx.textBaseline='middle';
    ctx.textAlign='center';
    
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

        ctx.fillStyle = 'white';
        if(num === 0){
            ctx.font = radius*0.20 + 'px arial';
            ctx.fillStyle = divColor;
         }else{
            ctx.font = radius*0.15 + 'px arial';
            ctx.fillStyle = '#9a929e';
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

    if(notes[1] === '1'){
        ctx.lineTo(50, -85);
    }
    if(notes[2] === '1'){
        ctx.lineTo(85, -50);
    }   
    if(notes[3] === '1'){
        ctx.lineTo(100, 0);
    }  
    if(notes[4] === '1'){
        ctx.lineTo(85, 50);
    }  
    if(notes[5] === '1'){
        ctx.lineTo(50,85);
    }  
    if(notes[6] === '1'){
        ctx.lineTo(0,100);
    }  
    if(notes[7] === '1'){
        ctx.lineTo(-50, 85);
    }  
    if(notes[8] === '1'){
        ctx.lineTo(-85, 50);
    }  
    if(notes[9] === '1'){
        ctx.lineTo(-100, 0);
    }  
    if(notes[10] === '1'){
        ctx.lineTo(-85, -50);
    }  
    if(notes[11] === '1'){
        ctx.lineTo(-50,-85);
    }  

    ctx.lineTo(0, -100);
    ctx.fillStyle = divColor;
    ctx.fill();
    
}

const drawFace = (ctx, radius) => {
    let grad;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.005, '#101010');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.017;
    ctx.stroke();

}


const playMode = (rootNote, notesArr, oct='X') => {    
    console.log('playMode function');

    notesArr = shuffle(notesArr);

    notesArr = randomlyRepeatNotes(notesArr);

    notesArr = randomlyReshuffle(notesArr);

    notesArr = randomlyShortenPhrase(notesArr);

    notesArr = randomlyPutHoles(notesArr);




    
    let notes = notesArr;
    console.log(notes);
    let delayt = randomlyGoHalfTime();
    if($('input[name=play_style]:checked').val() == 'chord'){
        delayt = 0;
    }
    //let delay = Array(notes.length).fill(delayt);
    let tmpdelay= 0;
    let ctxtime = MIDI.getContext().currentTime;

    const channel = 0;

    const velocity = lastVelocity;

    if(Math.floor(Math.random() * 3) === 1){
        //velocity = 100; //
        Math.floor((Math.random() * 20) + 80);
        lastVelocity = velocity;
    }

    if(oct == 'X'){
        rootNote = getRandomRootOctave(rootNote);
    }else{
        rootNote = rootNote + oct;
    }

    const rootNoteStr = MIDI.keyToNote[rootNote];

    if($('input[name=play_style]:checked').val() !== 'just_fills'){
        MIDI.noteOn(channel, rootNoteStr, velocity, 0);
        console.log('rootNote', rootNote);
        console.log('channel', channel);
    }
    

    if (delayt === tempo * .0000625){ //.15){
        notes = randomlyDoubleNotes(notes);
    }
    let delay = Array(notes.length).fill(delayt);
    
    if($('input[name=play_style]:checked').val() != 'root'){
        //console.log('notes',notes);
        //console.log('delay',delay);
        for(let i=0; i < notes.length; i++){
            //console.log('time', ctxtime+tmpdelay);
            const chordIt = Math.floor(Math.random() * 3);
            if(chordIt === 1){
                const chordIt2 = Math.floor(Math.random() * 3);
                if(chordIt2 === 1){
                    const harm2 = Math.floor(Math.random() * (notes.length - 1));
                    const harm3 = Math.floor(Math.random() * (notes.length - 1));
                    const note1 = notes[i];
                    const note2 = notes[harm2];
                    const note3 = notes[harm3];
                    //console.log('chord', note1, note2,note3);

                    MIDI.chordOn(channel, [note1,note2,note3], velocity / 2, ctxtime+tmpdelay);
                    MIDI.chordOff(channel, [note1,note2,note3], 4);
                }else{

                    const harm = Math.floor(Math.random() * (notes.length - 1));
                    const note1 = notes[i];
                    const note2 = notes[harm];
                    MIDI.chordOn(channel, [note1,note2], velocity / 2, ctxtime+tmpdelay);
                    MIDI.chordOff(channel, [note1,note2], 4);
                    //console.log('small chord', note1, note2);
                }
            }else{
                MIDI.noteOn(channel, notes[i], velocity, ctxtime+tmpdelay);
                MIDI.noteOff(channel, notes[i], 4);
            }
            
            if(delay[i] === -1 || delay[i] > 3) {
                delay[i] = 0;
            }

            tmpdelay = tmpdelay + delay[i]
        }
    }
}


const isClose = (a,b) => {
    if(b < a-20 || b > a+20){
        return false;
    }
    return true;

}

  
const on_click = (ev) => {
    console.log('on_click function');
    var x, y;
    
        if (ev.layerX || ev.layerX == 0) { 
          x = ev.layerX;
          y = ev.layerY;
        }
        
        x -= 150;
        y -= 150;
        y -= document.documentElement.scrollTop;

        let oct = '2';

        if(isClose(0, x) && isClose(-115, y)){
            inNote=true;
            clickedNote = viewNotes[0].replace('♭','b');

        }else if(isClose(60, x) && isClose(-100, y)){
            inNote=true;
            clickedNote = viewNotes[1].replace('♭','b');  
            if(clickedNote.charAt(0) === 'C'){
                oct = '3';
            }   
        }else if(isClose(100, x) && isClose(-60, y)){
            inNote=true;
            clickedNote = viewNotes[2].replace('♭','b');   
            if(clickedNote.charAt(0) === 'C' || clickedNote === 'Db'){
                oct = '3';
            }           
        }else if(isClose(115, x) && isClose(0, y)){
            inNote=true;
            clickedNote = viewNotes[3].replace('♭','b');   
            if(clickedNote.charAt(0) === 'C' || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }          
        }else if(isClose(100, x) && isClose(60, y)){
            inNote=true;
            clickedNote = viewNotes[4].replace('♭','b');      
            if(clickedNote.charAt(0) === 'C' || clickedNote.charAt(0) === 'D' || clickedNote === 'Eb'){
                oct = '3';
            }       
        }else if(isClose(60, x) && isClose(100, y)){
            inNote=true;
            clickedNote = viewNotes[5].replace('♭','b');   
            if(clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }            
        }else if(isClose(0, x) && isClose(115, y)){
            inNote=true;
            clickedNote = viewNotes[6].replace('♭','b');  
            if(clickedNote.charAt(0) === 'F' || clickedNote.charAt(0) === 'E' || clickedNote.charAt(0) === 'C' 
            || clickedNote.charAt(0) === 'D'){
                oct = '3';
            }                          
        }else if(isClose(-60, x) && isClose(100, y)){
           
            inNote=true;
            clickedNote = viewNotes[7].replace('♭','b');       
            if (clickedNote === 'Gb' || clickedNote.charAt(0) === 'F' || clickedNote.charAt(0) === 'E'
                || clickedNote.charAt(0) === 'C' || clickedNote.charAt(0) === 'D'){
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
            clickedNote = '';
        }

    if (inNote)  {

        playMode(clickedNote, [], oct);
      
    }
}

  

const multiDimensionalUnique = (arr) => {
    const uniques = [];
    const itemsFound = {};
    for(let i = 0, l = arr.length; i < l; i++) {
        let stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

const getNotes = (rootNote, mode) => {
    const chrome = R.concat(chromatic, chromatic);
    const start = chrome.indexOf(rootNote);
    const notes = [];
    for(let i = 0; i < 13; i++){
        if(mode[i] === '1'){

            const key = chrome[start + i] + '4';
            const note = MIDI.keyToNote[key]
            notes.push(note);
        }
    }
    return notes;
}

const perc2color = (perc) => {
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
    const h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}



const makeModeUI = (modes, div) => {
    modes = multiDimensionalUnique(modes);
    div.append('<div class="spacer" style="height:8px"></div>');
    for(let i = 0; i < modes.length; i++){
        let mode = modes[i];
        let num  = parseInt(mode.join(''),2);
        num2 = num - 2050;
        num2 = num2 / 15;
        let bgcolor = perc2color(num2);
        if(lastGroup !== mode.group){
            lastGroup = mode.group;
            div.append('<div class="spacer" style="height:5px"></div>');
        }
        let newdiv = $('<div class="mdv" data="' + mode + '" style="background-color:' + bgcolor + '"></div>');
        div.append(newdiv);
        newdiv.append('<span class="spn_key">' + mode.join('') + ' (' + num + ') ' + mode.group + '</span data=' + mode + '>')
        .append(document.getElementById('notes_template_container').innerHTML);
    }
}

const makeUI = () => {
    //let div = document.getElementById('scales_div');
    
    const div = $('#scales_div');

    makeModeUI(getModes(octatonicScales), div);
    makeModeUI(getModes(heptatonicScales), div);
    makeModeUI(getModes(hexatonicScales), div);
    makeModeUI(getModes(pentatonicScales), div);
    makeModeUI(getModes(tetratonicScales), div);
    makeModeUI(getModes(tritonicScales), div);
    
}



const getModes = (scales) => {
    let modes = [];

    for(let i = 0; i < scales.length; i++){
        let scale = scales[i];
        scale = R.concat(scale, scale);
        const newmodes = [];
       
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

    return modes;
}

const revStr = (s) => {
    return s.split('').reverse().join('');
}

const count = (string,char) => {
    var re = new RegExp(char,'gi');
    return string.match(re).length;
}

const arrayOfInts = (strArr) => {
    for(var i=0; i<strArr.length; i++) { strArr[i] = +strArr[i]; } 
    return strArr;
}

const getScales = (scalesArr, numNotes) => {

    let binStr = ''.padStart(numNotes, '1');
    binStr = binStr.padStart(12, '0');
    const starts = parseInt(binStr, 2);
    const ends = parseInt(revStr(binStr), 2);
    for(let i = starts; i < ends; i++){
        const nStr = i.toString(2).padStart(12, '0');
        const dStr = R.concat(nStr,nStr);

        if(dStr.search('111') === -1 && count(nStr,'1') === count(binStr,'1')){
            let exists = false;
            for(let j = 0; j < scalesArr.length; j++){
                jScale = R.concat(scalesArr[j].join(''), scalesArr[j].join(''));
                if(jScale.search(nStr) !== -1){
                    exists = true;
                    break;
                }
            }
            if(!exists){
                scalesArr.push(arrayOfInts(nStr.split('')));
            }
        }
    }
    return scalesArr;
}


const shuffle = (array) => {
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


const checkScale = (scale) => {
    for(let i = 0; i < scale.length; i++){
        if(scale[i] === 1 && scale[i+1] === 1 && scale[i+2] === 1){
            return false;
        }
    }
    return true;
}


const fillModes = () => {
    for(let i = 0; i < scales.length; i++){
        const scale = scales[i];
        const notesPerOctave = scale.notesPerOctave;
        const notes = [];
        for(let j = 0; j < notesPerOctave; j++){

        }
    }
}        


const randomlyRepeatNotes = (notesArr) => {
    notesArr = clone(notesArr);
    const loopTimes = Math.floor(Math.random() * (notesArr.length));
    for(let lp = 0; lp < loopTimes; lp++){
        const randomNote = Math.floor(Math.random() * (notesArr.length - 1));
        notesArr[randomNote + 1] = notesArr[randomNote];
    }
    return notesArr;
}

const randomlyReshuffle = (notesArr) => {
    notesArr = clone(notesArr);
    const reshuf = Math.floor(Math.random() * 2);
    
    if(reshuf === 1){
        notesArr = shuffle(notesArr);
    }
    return notesArr;
}

const randomlyShortenPhrase = (notesArr) => {
    notesArr = clone(notesArr);
    const doStrip =  Math.floor(Math.random() * 3);
    if(doStrip === 1){
        let stripEnd = Math.floor(Math.random() * (notesArr.length - 1));
        while(stripEnd > 1){
            notesArr.pop();
            stripEnd--;
        }
    }
    return notesArr;
}

const randomlyPutHoles = (notesArr) => {
    notesArr = clone(notesArr);
    const putHoles = Math.floor(Math.random() * 4);
    if(putHoles === 1 || putHoles === 2 || putHoles === 3){
        let numHoles = Math.floor(Math.random() * (notesArr.length - 3));
        numHoles = numHoles + 2;
        while(numHoles > 0){
            const pHole = Math.floor(Math.random() * (notesArr.length - 1));
            notesArr[pHole] = 0;
            numHoles--;
        }           
    }
    return notesArr;
}

const randomlyGoHalfTime = () => {      
    
    console.log('tempo', tempo);
    let delayt = tempo * .000125; //.3;
    if ($('input[name=play_style2]:checked').val() == 'double') {
        delayt = tempo * .0000625; //.15;
    }else if ($('input[name=play_style2]:checked').val() == 'random') {
        let mydelayT = Math.floor(Math.random() * 2);
        if (mydelayT === 1) {
            delayt = tempo * .0000625; //.15;
        }
    }    

    return delayt;
}

const getRandomRootOctave = (note) => {
    const rootOctR = Math.floor(Math.random() * 3);
    if(rootOctR === 1){
        return note + '2';
    }else{
        return note + '1';
    }
}

const randomlyDoubleNotes = (notes) => {
    let connotes = clone(notes);
    if(Math.floor(Math.random() * 3) === 1){
        connotes.reverse();
    }else if(Math.floor(Math.random() * 3) === 2){
        connotes = shuffle(connotes);
    }

    const bs = Math.floor(Math.random() * 3);
    if(bs === 0){
        notes = notes.concat(connotes);
    }
    return notes;
}

const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}