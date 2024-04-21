
//start of Pet class

class Pet {
    constructor(name) {
        this.name = name
        this.attributes = {
            health: {
                value: getPetHealth(),
                timeFactor: false,
                increment: false,
                maxValue: 100
            }, 
            hunger: {
                value: getPetHunger(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20
            },
            boredom: {
                value: getPetBoredom(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20
            },
            sleepiness: {
                value: getPetSleepiness(),
                timeFactor: 3,
                increment: 1,
                maxValue: 20
            },
            will: {
                value: getPetWill(),
                timeFactor: 30,
                increment: -1,
                maxValue: 20
            },
            money: {
                value: getPetMoney()
            },
            age: {
                value: getPetAge(),
                timeFactor: 10,
                increment: 1,
                maxValue: 100
            }
        }
    }
    updatePetTimeboundAttributes() {
        for (let attribute in this.attributes) {
            if (getGameTime() % this.attributes[attribute].timeFactor === 0 && this.attributes[attribute].value < this.attributes[attribute].maxValue && this.attributes[attribute].value > 0) {
                this.attributes[attribute].value += this.attributes[attribute].increment
            }
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

setInterval(game, 1000);

function game() {
    changeGameTime(1)
    //console.log(timeFactors)
    const playerPet = new Pet('yolo')
    console.log(playerPet)
    playerPet.updatePetTimeboundAttributes()
    console.log(playerPet)
    playerPet.writePetAttributes()
    console.log(playerPet)
}

//end of time and main game controller
//basic getters and setters, other core functionality 

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