// start of Game class
class Game {
    constructor () {
        this.time = getGameTime()
        this.state = getGameState()
    }
    incrementTime() {
        changeGameTime(1)
    }
    setState(state) {
        document.getElementById('game_attribute_state').textContent = state
    }
    pause() {
        this.setState('paused')
        setElementActive('play', true)
        setElementActive('pause', false)
    }
    play() {
        this.setState('playing')
        setElementActive('pause', true)
        setElementActive('play', false)
    }
    reload() {
        location.reload()
    }
    registerControlButtons() {
        document.getElementById('play').addEventListener('click', () => this.play())
        document.getElementById('pause').addEventListener('click', () => this.pause())
        document.getElementById('reload').addEventListener('click', () => this.reload())
        //note text on the bottom (1) from GPT-4 about why this.play etc did not work.
    }
}

//end of Game class
//start of Pet class

class Pet {
    constructor() {
        this.name = getPetName()
        this.attributes = {
            health: {
                value: getPetHealth(),
                timeFactor: false,
                increment: false,
                maxValue: 100,
                minValue: 0
            }, 
            hunger: {
                value: getPetHunger(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            boredom: {
                value: getPetBoredom(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            sleepiness: {
                value: getPetSleepiness(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            will: {
                value: getPetWill(),
                timeFactor: 30,
                increment: -1,
                maxValue: 20,
                minValue: 0
            },
            money: {
                value: getPetMoney()
            },
            age: {
                value: getPetAge(),
                timeFactor: 10,
                increment: 1,
                maxValue: 100,
                minValue: 0
            }
        }
    }
    updateTimeboundAttributes() {
        for (let attribute in this.attributes) {
            let currAttr = this.attributes[attribute]
            if (getGameTime() % currAttr.timeFactor === 0) {
                let proposedNewValue = currAttr.value + currAttr.increment
                if (proposedNewValue <= currAttr.maxValue && proposedNewValue >= currAttr.minValue)
                currAttr.value = proposedNewValue
            }
        }
    }
    incrementHealth() {
        const healthChangeArr = [getValueForIncrementHealth(this.attributes.hunger),
            getValueForIncrementHealth(this.attributes.sleepiness),
            getValueForIncrementHealth(this.attributes.boredom)
        ]
        let healthChangeAgr = 0
        healthChangeArr.forEach(element => {
            healthChangeAgr += element
        });
        const proposedHealth = this.attributes.health.value + healthChangeAgr
        if (proposedHealth > this.attributes.health.minValue && proposedHealth < this.attributes.health.maxValue) {
            this.attributes.health.value = proposedHealth
            return
        }
        if (proposedHealth >= this.attributes.health.maxValue) {
            this.attributes.health.value = this.attributes.health.maxValue
            return
        }
        if (proposedHealth <= this.attributes.health.minValue) {
            this.attributes.health.value = this.attributes.health.minValue
            return
        }
    }
    writeAttributes() {
        for (let attribute in this.attributes) {
            setPetAttributeValue(attribute, this.attributes[attribute].value)
        }
    }
}
//end of pet class
// time and main game controller

setInterval(run, 1000);

function run() {
    const game = new Game()
    game.registerControlButtons()
    if (game.state === 'playing') {
        game.incrementTime()
        const playerPet = new Pet()
        playerPet.updateTimeboundAttributes()
        playerPet.incrementHealth()
        playerPet.writeAttributes()
        console.log(playerPet)
    }
}

//end of time and main game controller
//basic getters and setters, other core functionality

function configureGame() {
    const petName = document.getElementById('pet_attribute_name_enterfield').value
    setSpan('pet_attribute_name', petName)
    setElementVisibility('gamecontrols', true)
    setElementVisibility('gamestats', true)
    setElementVisibility('petstats', true)
    setElementVisibility('config', false)
    setElementActive('play', true)
}

function getPetName() {
    return document.getElementById('pet_attribute_name').textContent
}

function setElementVisibility(id, visible) {
    let visibility = 'none'
    if (visible === true) {
        visibility = 'block'
    }
    document.getElementById(id).style.display = visibility
}

function setSpan(id, string) {
    document.getElementById(id).textContent = string
}

function getValueForIncrementHealth(attribute) {
    if (attribute.value === attribute.maxValue) {
        return -1
    }
    if (attribute.value <= attribute.maxValue * .25) {
        return 1
    }
    return 0
}

function setElementActive(id, state) {
    if(state) {
        document.getElementById(id).disabled = false
    } else {
        document.getElementById(id).disabled = true
    }
}

function getGameState() {
    return document.getElementById('game_attribute_state').textContent
}

function getSpanValueAsNumber(id) {
    return Number(document.getElementById(id).textContent)
}

function changeSpanValueNumber(id, changeBy) {
    let span = document.getElementById(id)
    span.textContent = Number(span.textContent) + Number(changeBy)
}

function setPetAttributeValue(attribute, newValue) {
    let id = "pet_attribute_" + attribute
    document.getElementById(id).textContent = Number(newValue)
}

function changePetHunger(changeBy) {
    changeSpanValueNumber('pet_attribute_hunger', changeBy)
}

function changePetHealth(changeBy) {
    changeSpanValueNumber('pet_attribute_health', changeBy)
}

function changePetSleepiness(changeBy) {
    changeSpanValueNumber('pet_attribute_sleepiness', changeBy)
}

function changePetBoredom(changeBy) {
    changeSpanValueNumber('pet_attribute_boredom', changeBy)
}

function changePetWill(changeBy) {
    changeSpanValueNumber('pet_attribute_will', changeBy)
}

function changePetAge(changeBy) {
    changeSpanValueNumber('pet_attribute_age', changeBy)
}

function changePetMoney(changeBy) {
    changeSpanValueNumber('pet_attribute_money', changeBy)
}

function changeGameTime(changeBy) {
    changeSpanValueNumber('game_attribute_time', changeBy)
}

function getGameTime() {
    return getSpanValueAsNumber('game_attribute_time')
}

function getPetMoney() {
    return getSpanValueAsNumber('pet_attribute_money')
}

function getPetHealth() {
    return getSpanValueAsNumber('pet_attribute_health')
}

function getPetHunger() {
    return getSpanValueAsNumber('pet_attribute_hunger')
}

function getPetSleepiness() {
    return getSpanValueAsNumber('pet_attribute_sleepiness')
}

function getPetBoredom() {
    return getSpanValueAsNumber('pet_attribute_boredom')
}

function getPetWill() {
    return getSpanValueAsNumber('pet_attribute_will')
}

function getPetAge() {
    return getSpanValueAsNumber('pet_attribute_age')
}

//end of basic getters and setters

/* Notes
1. registerControlButtons explanation: 
The issue you're encountering is due to the way this is being handled within the event listeners. When you pass this.play and this.pause as callbacks to addEventListener, the this inside those methods no longer refers to the instance of the Game class when they are called. Instead, this refers to the element that the event was acted upon (in this case, the button elements).

To fix this, you need to ensure that this within your play, pause, and reload methods still refers to the Game instance. You can do this by binding this to the methods when you pass them as callbacks. Here's how you can modify the registerControlButtons method to bind this:

registerControlButtons() {
    document.getElementById('play').addEventListener('click', this.play.bind(this))
    document.getElementById('pause').addEventListener('click', this.pause.bind(this))
    document.getElementById('reload').addEventListener('click', this.reload.bind(this))
}
By using .bind(this), you create a new function with this bound to the current instance of the Game class, ensuring that this.setState and other instance methods and properties are accessible within the play, pause, and reload methods.

Alternatively, you can use arrow functions to preserve the context of this because arrow functions do not have their own this context and inherit it from the surrounding scope:

registerControlButtons() {
    document.getElementById('play').addEventListener('click', () => this.play())
    document.getElementById('pause').addEventListener('click', () => this.pause())
    document.getElementById('reload').addEventListener('click', () => this.reload())
}
Either of these solutions should fix the error you're encountering.


*/