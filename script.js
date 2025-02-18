let currentSong = new Audio();

function convertToSecondsMinutes(time) {
    const minutes = Math.floor(time / 60); // Get whole minutes
    const seconds = Math.floor(time % 60); // Get remaining seconds
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/MusicMp3/");
    let response = await a.text();
    // console.log(response);

    let div = document.createElement('div');
    div.innerHTML = response;
    // let lis = div.getElementsByTagName("a");
    let elems = div.getElementsByClassName("icon-mp3");
    // console.log(elems);

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
    currentSong.src = "/MusicMp3/" + track + ".mp3";
    currentSong.play();
    play.className = "fa-regular fa-circle-pause";
    document.querySelector(".song-name").innerHTML = track;
}

async function main() {
    let songs = await getSongs();
    // console.log(songs);
    currentSong.src = songs[0];
    document.querySelector(".song-name").innerHTML = `${songs[0].split("Mp3/")[1].replaceAll("%20", " ").split(".")[0]}`;
    
    let songCont = document.querySelector(".songs-container");

    for (const song of songs) {
        let songCard = document.createElement("div");
        songCard.className = "song-card";
        console.log(song);

        songCard.innerHTML = `<div class="song-card flex border1">
              <i class="fa-solid fa-music"></i>
              <div class="song-info">
                <div class="name">${song.split("Mp3/")[1].replaceAll("%20", " ").split(".")[0]}</div>
                <div class="artist">Kunal</div>
              </div>
              <p>Play Now</p>
              <i class="fa-regular fa-circle-play"></i>
            </div>`;
        // console.log(songCard);
        songCont.append(songCard);
    }

    // Event Listener for each song to play
    Array.from(document.querySelector(".songs-container").childNodes).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector('.song-info').querySelector(".name").innerText);
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
        console.log(`${convertToSecondsMinutes(currentSong.currentTime)}/${convertToSecondsMinutes(currentSong.duration)}`);
        document.querySelector(".song-duration").innerHTML = `${convertToSecondsMinutes(currentSong.currentTime)}/${convertToSecondsMinutes(currentSong.duration)}`;
        document.querySelector(".seekbar-pointer").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    })

    // Seekbar-pointer motion
    document.querySelector(".seekbar").addEventListener("click", e => {
        console.log(e.offsetX, e.target.getBoundingClientRect().width);
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
}

main();
