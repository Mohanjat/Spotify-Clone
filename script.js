console.log("hey im here")

let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder){

    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0]

    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
        <div class="listAlbum">
        <img src="./images/music.svg" alt="" class="invert" >
        <div class="listInfo">
            <p>${song.replaceAll("%20", " ")}</p>
            <p>Arijit Singh</p>
        </div>
        </div>

        <div class="listPlayNow">
           <p>Play Now</p>
           <img src="./images/play1.svg" alt="" class="invert" >
        </div>
    </li>`;
    }

    return songs;

}

const playMusic = (track,pause=false) =>{
    // let audio = new Audio();
 
    //we need to update current song at every time when we wants to play the new song
    //agr esa nhi krenge to saare last wala song bhi play hota rhega

    currentSong.src = `/${currFolder}/` + track
    //ek base song daal dete h jo ki starting m load rhega
    if(!pause){
        currentSong.play();
        play.src = "./images/pause.svg"; 
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track)   
    document.querySelector(".songtime").innerHTML = "00.00/00.00"
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
  

//making dynamic albums
async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array  = Array.from(anchors);
    let cardContainer = document.querySelector(".cardContainer");
    for (let index = 0; index < array.length; index++) {
        let e = array[index];
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0];
            
            //get the metadata for the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)

            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML +  `<div data-folder="${folder}" class="card">
                        
            <div class="play_inside">
                <svg data-encore-id="icon" width="27" role="img" aria-hidden="true" viewBox="0 0 24 24" 
                class="Svg-sc-ytk21e-0 bneLcE">
                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                </svg>
            </div>
            
            <img class="card_img" src="/songs/${folder}/cover.jpg" alt="card Image">
            <h4 class="card_heading">${response.title}</h4>
            <p class="card_para">${response.description}</p>
        </div>`


        }
        
    }
    //Load the playlist whenever card is clicked
    //now first of all select card and create array of all the cards and iterate all over the loop
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e);
        e.addEventListener("click", async item=>{
            // console.log(`${item.currentTarget.dataset.folder}`);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        }) 
    });

    
}

async function main(){

    await getSongs("songs/Favsong")
    
    playMusic(songs[0],true);
    
    //display all the albums on the page
    displayAlbums();

    //add a eventlistner to each song
    //create a array of all the li from the song list
    let arr = Array.from(document.querySelector(".songsList").getElementsByTagName("li"))

    //now traverse on the arr;
    arr.forEach(e => {
        //if we click anywhere in the list than the song should be play, that's why adding eventlistner
        //on the all the list
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".listInfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".listInfo").firstElementChild.innerHTML.trim())
        })
        
    });


    //Now add eventListner to play, next and prev

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "./images/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "./images/play1.svg";
        }
    })

    //Now listen for timeUpdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}
        /${formatTime(currentSong.duration)}`
        
        //update left of the circle
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*
        100 +"%";
    })

    //now add eventlistner to the seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent +"%";
        currentSong.currentTime = (currentSong.duration * percent)/100;
    })

    //add evenlistner to the hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })
    

    //add eventlistner to the close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //add eventlistner to the next button
    document.querySelector("#next").addEventListener("click",()=>{
        currentSong.pause();
        //current song ka index find kr lo aur next index waala song play kr do
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);       

        if(index+1 < songs.length){
            playMusic(songs[index+1]);
        }
        
    })   
    
    //add eventlistner to the previous button
    prev.addEventListener("click",()=>{
        currentSong.pause();
        
        //current song ka index find kr lo aur previous index waala song play kr do
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);       
    
        if(index-1 >= 0){
            playMusic(songs[index-1]);
        }

    })   

    //add eventlistner to the volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100 
    })


    //add event listner to mute the volume
    document.querySelector(".songVol>img").addEventListener("click", e=>{
        console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
        
    })

    
}

main(); 