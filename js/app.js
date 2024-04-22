
class Game {
    constructor () {
        this.time = getGameTime()
        this.state = getGameState()
    }
    incrementTime() {
        changeGameTime(1)
    }
}

//start of Pet class

class Pet {
    constructor(name) {
        this.name = name
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
    updatePetTimeboundAttributes() {
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
    }
    writePetAttributes() {
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
    if (game.state === 'playing') {
        game.incrementTime()
        const playerPet = new Pet('yolo')
        playerPet.updatePetTimeboundAttributes()
        playerPet.incrementHealth()
        playerPet.writePetAttributes()
        console.log(playerPet)
    }
}

//end of time and main game controller
//basic getters and setters, other core functionality

function getValueForIncrementHealth(attribute) {
    if (attribute.value === attribute.maxValue) {
        return -1
    }
    if (attribute.value <= attribute.maxValue * .25) {
        return 1
    }
    return 0
}

function pauseGame() {
    changeGameState('paused')
    setElementActive('play', true)
    setElementActive('pause', false)
}

function startGame() {
    changeGameState('playing')
    setElementActive('pause', true)
    setElementActive('play', false)
}

function changeGameState(state) {
    let span = document.getElementById('game_attribute_state')
    span.textContent = state
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

function reload() {
    location.reload()
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