const main = document.querySelector("main");
const header = document.querySelector("header");
let disrupt = true;

main.addEventListener("scroll", (event) => {
    if (event.target.scrollTop > 50 && disrupt) {
        header.classList.add("headerSmall");
    }
});

const home = () => {
    disrupt = false;
    main.scrollTop = 0;
    header.classList.remove("headerSmall");
    setTimeout(() => {
        disrupt = true;
    }, 500);
}