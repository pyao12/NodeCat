import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"

import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import {
    faXmark,
    faMinimize,
    faWindowMaximize,
    faCircleDot,
    faPlus,
    faFloppyDisk,
    faFile,
    faBookmark,
    faPowerOff,
    faRotateLeft,
    faRotateRight,
    faScissors,
    faCopy,
    faPaste,
    faObjectGroup,
} from "@fortawesome/free-solid-svg-icons"

library.add(
    faXmark,
    faMinimize,
    faWindowMaximize,
    faCircleDot,
    faPlus,
    faFloppyDisk,
    faFile,
    faBookmark,
    faPowerOff,
    faRotateLeft,
    faRotateRight,
    faScissors,
    faCopy,
    faPaste,
    faObjectGroup
)

createApp(App).component("font-awesome-icon", FontAwesomeIcon).mount("#app")
