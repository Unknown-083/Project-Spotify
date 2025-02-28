let currentSong = new Audio();
let songs;
let currFolder;

function convertToSecondsMinutes(time) {
    if(isNaN(time) || time<0) return "00:00";

    const minutes = Math.floor(time / 60); // Get whole minutes
    const seconds = Math.floor(time % 60); // Get remaining seconds
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    let a = await fetch(`/MusicMp3/${folder}`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    
    let elems = div.getElementsByClassName("icon-mp3");

    let songs = [];

    for (let index = 0; index < elems.length; index++) {
        const element = elems[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href);
        }
    }

    return songs
}

const playMusic = (track) => {
    currentSong.src = `/MusicMp3/${currFolder}/` + track + ".mp3";
    currentSong.play();
    play.className = "fa-regular fa-circle-pause";
    document.querySelector(".song-name").innerHTML = track;
}

async function main() {
    async function loadFolders() {
        console.log(document.location.pathname);
        let a = await fetch(`${document.location.origin}/MusicMp3`);
        let response = await a.text();
        
        console.log(response);
        let div = document.createElement('div');
        div.innerHTML = response;
        console.log(div);

        let elem = div.getElementsByClassName('icon');

        let folders = [];
        for (let index = 1; index < elem.length; index++) {
            const element = elem[index];
            folders.push(element.href);
        }
        return folders;
    }
    
    folders = await loadFolders();

    console.log(folders);
    currFolder = folders[0].split("Mp3")[1];

    let playlistCont = document.querySelector(".playlist-container");

    for (const folder of folders) {
        let playlist = document.createElement('div');

        let info = await fetch(`${folder}/info.json`);
        let response = await info.json();

        let playlistLogo = await fetch(`${folder}/cover.webp`);
        let cover = playlistLogo.url;

        playlist.innerHTML = `<div class="playlist">
              <img class="playlist-logo" src="${cover}" alt="cover">
              <img class="hoverPlaybutton" src="images/playlistPlaybutton.svg" alt="">
              <h4 class="title">${response.title}</h4>
              <p class="description">${response.description}</p>
            </div>`;

        playlistCont.append(playlist);
    }

    songs = await getSongs(currFolder);
    currentSong.src = songs[0];
    document.querySelector(".song-name").innerHTML = `${songs[0].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]}`;
    
    let songCont = document.querySelector(".songs-container");

    for (const song of songs) {
        let songCard = document.createElement("div");
        songCard.className = "song-card";

        songCard.innerHTML = `<div class="song-card flex border1">
              <i class="fa-solid fa-music"></i>
              <div class="song-info">
                <div class="name">${song.split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]}</div>
                <div class="artist">Kunal</div>
              </div>
              <p>Play Now</p>
              <i class="fa-regular fa-circle-play"></i>
            </div>`;
        
        songCont.append(songCard);
    }

    // Event Listener for each song to play
    Array.from(document.querySelector(".songs-container").childNodes).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector('.song-info').querySelector(".name").innerText);
            playMusic(e.querySelector('.song-info').querySelector(".name").innerText);
        })
    });

    // Event Listener for play, privious and next
    play.addEventListener("click", element=> {
        if(currentSong.paused){
            currentSong.play();
            play.className = "fa-regular fa-circle-pause";
        }
        else{
            currentSong.pause();
            play.className = "fa-regular fa-circle-play";
        }
    })

    // Change duration for audio
    currentSong.addEventListener("timeupdate", () => {
        // console.log(`${convertToSecondsMinutes(currentSong.currentTime)}/${convertToSecondsMinutes(currentSong.duration)}`);
        document.querySelector(".song-duration").innerHTML = `${convertToSecondsMinutes(currentSong.currentTime)}/${convertToSecondsMinutes(currentSong.duration)}`;
        document.querySelector(".seekbar-pointer").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    // Seekbar-pointer motion
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.offsetX, e.target.getBoundingClientRect().width);
        let location = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seekbar-pointer").style.left = location + "%";
        currentSong.currentTime = ((currentSong.duration)*location)/100;
    })

    // Event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".left").style.zIndex = 1;
        document.querySelector(".left").style.backgroundColor = "black";
        document.querySelector(".left").style.width = "min(400px, 90vw)";
        document.querySelector(".close").style.display = "unset";
    })

    // Event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // Event listerner for previous
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if(currentIndex>0){
            playMusic(songs[currentIndex-1].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]);
        }

        else{
            playMusic(songs[songs.length-1].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]);
            // console.log("works");
        }
    })
    
    // Event listerner for next
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if(currentIndex+1<songs.length){
            playMusic(songs[currentIndex+1].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]);
        }

        else{
            playMusic(songs[0].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]);
        }
        // console.log("works")
    })

    // Event listener for volume
    volumeRange.addEventListener("change", (e) => {
        // console.log(e.target.value);
        currentSong.volume = e.target.value/100;

        if(currentSong.volume>0){
            document.querySelector(".muteUnmute").querySelector("i").className = "fa-solid fa-volume-high";
        }

        if(currentSong.volume==0){
            document.querySelector(".muteUnmute").querySelector("i").className = "fa-solid fa-volume-xmark";
        }
    })

    // Event listener for mute and unmute
    document.querySelector(".muteUnmute").querySelector('i').addEventListener("click", (e) => {
        if(e.target.className == "fa-solid fa-volume-high"){
            e.target.className = `fa-solid fa-volume-xmark`;
            currentSong.volume = 0;
            volumeRange.value = 0;
        }
        else{
            e.target.className = `fa-solid fa-volume-high`;
            currentSong.volume = 0.5;
            volumeRange.value = 50; 
        }
        console.log(e,'click')
    })

    // Load songs of Playlist
    
    Array.from(document.querySelectorAll(".playlist")).forEach((e) => {
        e.addEventListener("click", async () => {
            console.log(e);
            console.log(e.querySelector(".title").innerText);
            let folderName = e.querySelector(".title").innerText;
            
            currFolder = folderName.replaceAll(" ", "%20");
            
            document.querySelector(".songs-container").innerHTML = "";

            songs = await getSongs(e.querySelector(".title").innerText);

            currentSong.src = songs[0];
            console.log(`${songs[0].split(currFolder+'/')[1]}`);
            document.querySelector(".song-name").innerHTML = `${songs[0].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]}`;
            let songCont = document.querySelector(".songs-container");

            for (const song of songs) {
                let songCard = document.createElement("div");
                songCard.className = "song-card";

                songCard.innerHTML = `<div class="song-card flex border1">
                    <i class="fa-solid fa-music"></i>
                    <div class="song-info">
                        <div class="name">${song.split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]}</div>
                        <div class="artist">Kunal</div>
                    </div>
                    <p>Play Now</p>
                    <i class="fa-regular fa-circle-play"></i>
                    </div>`;
                
                songCont.append(songCard);
            }

            playMusic(songs[0].split(currFolder+'/')[1].replaceAll("%20", " ").split(".")[0]);
        
            Array.from(document.querySelector(".songs-container").childNodes).forEach(e => {
                e.addEventListener("click", element => {
                    console.log(e.querySelector('.song-info').querySelector(".name").innerText);
                    playMusic(e.querySelector('.song-info').querySelector(".name").innerText);
                })
            });
        })
    })

    

}

main();
