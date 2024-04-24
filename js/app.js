// start of Game class
class Game {
    constructor () {
        this.time = getGameTime()
        this.state = getGameState()
        this.pauseCount = getSpanValueAsNumber('game_attribute_count_pauses')
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
        console.log('i am running')
        changeSpanValueNumber('game_attribute_count_pauses', 1)
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
        if (Pet._instance) {
            return Pet._instance
        }
        Pet._instance = this
        this.name = getPetName()
        this.inventory = []
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
    changeAttributeValue(attribute, proposedChangeBy) {
        const currentAttribute = this.attributes[attribute]
        const proposedNewValue = currentAttribute.value + proposedChangeBy
        console.log(`proposed value of ${proposedNewValue}, current value ${currentAttribute.value}, change by ${proposedChangeBy}`)
        if (proposedNewValue >= currentAttribute.maxValue) {
            console.log(`The proposedNewValue for ${attribute} is ${proposedNewValue}, this is illegal, setting the value to ${currentAttribute.maxValue} instead.`)
            this.attributes[attribute].value = currentAttribute.maxValue
            setPetAttributeValue(attribute, currentAttribute.maxValue)
            return
        }
        if (proposedNewValue <= currentAttribute.minValue) {
            console.log(`The proposedNewValue for ${attribute} is ${proposedNewValue}, this is illegal, setting the value to ${currentAttribute.minValue} instead.`)
            this.attributes[attribute].value = currentAttribute.minValue
            setPetAttributeValue(attribute, currentAttribute.minValue)
            return
        }
        console.log(`The proposedNewValue for ${attribute} is ${proposedNewValue}, setting as requested.`)
        this.attributes[attribute].value = proposedNewValue
        setPetAttributeValue(attribute, proposedNewValue)
        return
    }
    changeAttributeMaxValue(attribute, changeBy) {
        this.attributes[attribute].maxValue += changeBy
    }
    writeAttributes() {
        for (let attribute in this.attributes) {
            setPetAttributeValue(attribute, this.attributes[attribute].value)
        }
    }
    registerControlButtons() {
        document.getElementById('feed').addEventListener('click', () => this.feed())
        document.getElementById('sleep').addEventListener('click', () => this.sleep())
        document.getElementById('entertain').addEventListener('click', () => this.entertain())
        document.getElementById('read').addEventListener('click', () => this.read())
        document.getElementById('work').addEventListener('click', () => this.work())
        document.getElementById('exercise').addEventListener('click', () => this.exercise())
    }
    checkAffordability(thing) {
        //future expansion intended here
        switch (thing) {
            case "work":
                if (this.attributes.age.value >=1) {
                    return true
                } else {
                    return false
                }
                break
            default:
                return true
        }
    }
    enableControlButtons() {
        if (this.attributes.hunger.value > 0 && this.checkAffordability('feed')) {
            setElementActive('feed', true)
        } else {
            setElementActive('feed', false)
        }
        if (this.attributes.sleepiness.value > 0 && this.checkAffordability('sleep')) {
            setElementActive('sleep', true)
        } else {
            setElementActive('sleep', false)
        }
        if (this.attributes.boredom.value > 0 && this.checkAffordability('entertain')) {
            setElementActive('entertain', true)
        } else {
            setElementActive('entertain', false)
        }
        if (this.attributes.will.value < this.attributes.will.maxValue && this.checkAffordability('read')) {
            setElementActive('read', true)
        } else {
            setElementActive('read', false)
        }
        if (this.checkAffordability('work')) {
            setElementActive('work', true)
        } else {
            setElementActive('work', false)
        }
        if (this.checkAffordability('exercise')) {
            setElementActive('exercise', true)
        } else {
            setElementActive('exercise', false)
        }
    }
    feed() {
        this.changeAttributeValue('hunger', -5)
        if (probabilityCheck(50)) {
            this.changeAttributeValue('hunger', -5)
            this.changeAttributeValue('sleepiness', 5)
        } 
    }
    sleep() {
        this.changeAttributeValue('sleepiness', -5)
        this.changeAttributeValue('hunger', 5)
        if (probabilityCheck(50)) {
            this.changeAttributeValue('hunger', 5)
            this.changeAttributeValue('sleepiness', -5)
            this.changeAttributeValue('boredom', 5)
        }        
    }
    entertain() {
        this.changeAttributeValue('boredom', -5)
        if (probabilityCheck(50)) {
            this.changeAttributeValue('hunger', 5)
            this.changeAttributeValue('sleepiness', 5)
            this.changeAttributeValue('boredom', -5)
        }
        if (probabilityCheck(10)) {
            this.changeAttributeValue('boredom', 5)
        }
    }
    read() {
        this.changeAttributeValue('hunger', 5)
        this.changeAttributeValue('sleepiness', 5)
        this.changeAttributeValue('boredom', 5)
        if (probabilityCheck(25)) {
            this.changeAttributeValue('will', 5)
        }
    }
    work() {
        this.changeAttributeValue('hunger', 5)
        this.changeAttributeValue('sleepiness', 5)
        this.changeAttributeValue('boredom', 5)
        this.changeAttributeValue('money', 100)
        if (probabilityCheck(this.attributes.will.value)) {
            this.changeAttributeValue('money', 500)
        }
    }
}

class Marketplace {
    constructor() {
        if (Marketplace._instance) {
            return Marketplace._instance
        }
        Marketplace._instance = this
        this.items = [
            {name: 'Meditations of Marcus Aurelius',
             price: 500,
             givesYou: 'more maximum will',
             available: 1,
             effect: (pet) => {pet.changeAttributeMaxValue('will', 10)} 
             },
             {name: 'Letters from a Stoic by Seneca',
             price: 500,
             givesYou: 'more maximum will',
             available: 1,
             effect: (pet) => {pet.changeAttributeMaxValue('will', 10)}
            }
        ]
    }
    processButtons(pet) {
        const marketplaceContainer = document.getElementById('marketplace_container')
        while (marketplaceContainer.firstChild) {
            marketplaceContainer.removeChild(marketplaceContainer.lastChild)
        } 
        this.items.forEach(element => {
            if (element.available) {
                let newButton = document.createElement('button')
                newButton.innerText = `Buy '${element.name}' for $${element.price}. It will give you ${element.givesYou}.`
                newButton.disabled = pet.attributes.money.value < element.price
                newButton.addEventListener('click', () => {
                    pet.inventory.push(element)
                    element.available -= 1
                    pet.changeAttributeValue('money', -(element.price))
                    element.effect(pet)
                })
                marketplaceContainer.appendChild(newButton)
            }
        })
    }
}

//end of pet class

// time and main game controller
let gameControlButtonsRegistered = false
let petControlButtonsRegistered = false
setInterval(run, 1000);

function run() {
    const game = new Game()
    const market = new Marketplace()
    if (gameControlButtonsRegistered === false) {
        //this prevents duplication of game control registration
        game.registerControlButtons()
        gameControlButtonsRegistered = true
    }
    if (game.state === 'playing') {
        game.incrementTime()
        const playerPet = new Pet()
        if (petControlButtonsRegistered === false) {
            playerPet.registerControlButtons()
            petControlButtonsRegistered = true
        }
        playerPet.updateTimeboundAttributes()
        playerPet.enableControlButtons()
        playerPet.incrementHealth()
        market.processButtons(playerPet)
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
    setElementVisibility('petcontrols', true)
    setElementVisibility('marketplace', true)
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
    //console.log(`Going to set ${id} to ${newValue}`)
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

function probabilityCheck(probabilityInt) {
    if (isNaN(probabilityInt)) {
        throw new Error(`we need an int, you gave us '${probabilityInt}'`);
    }
    if (probabilityInt > 100) {
        probabilityInt = 100
    }
    if (probabilityInt < 0) {
        probabilityInt = 0
    }
    const random = Math.floor(Math.random() * 100)
    let returnValue = random < probabilityInt
    console.log(`Returning ${returnValue} on a probability request with value of ${probabilityInt}`)
    return returnValue
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