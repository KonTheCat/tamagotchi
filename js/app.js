// start of Game class
class Game {
    constructor () {
        this.time = getSpanValueAsNumber('game_attribute_time')
        this.state = document.getElementById('game_attribute_state').textContent
        this.pauseCount = getSpanValueAsNumber('game_attribute_count_pauses')
    }
    incrementTime() {
        changeSpanValueNumber('game_attribute_time', 1)
    }
    setState(state) {
        document.getElementById('game_attribute_state').textContent = state
    }
    pause() {
        this.setState('paused')
        setElementActive('play', true)
        setElementActive('pause', false)
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
    win(){
        this.setState('you win!')
        this.lockAllControlsOtherThanReload()
    }
    lose() {
        this.setState('you lose!')
        this.lockAllControlsOtherThanReload()
    }
    lockAllControlsOtherThanReload() {
        const buttons = document.querySelectorAll('button')
        for (let button of buttons) {
            button.disabled = true
        }
        setElementActive('reload', true)
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
        this.name = document.getElementById('pet_attribute_name').textContent
        this.inventory = []
        this.attributes = {
            health: {
                value: getSpanValueAsNumber('pet_attribute_health'),
                timeFactor: false,
                increment: false,
                maxValue: 100,
                minValue: 0
            }, 
            hunger: {
                value: getSpanValueAsNumber('pet_attribute_hunger'),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            boredom: {
                value: getSpanValueAsNumber('pet_attribute_boredom'),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            sleepiness: {
                value: getSpanValueAsNumber('pet_attribute_sleepiness'),
                timeFactor: 3,
                increment: 1,
                maxValue: 20,
                minValue: 0
            },
            will: {
                value: getSpanValueAsNumber('pet_attribute_will'),
                timeFactor: 30,
                increment: -1,
                maxValue: 20,
                minValue: 0
            },
            money: {
                value: getSpanValueAsNumber('pet_attribute_money')
            },
            passiveincome: {
                value: getSpanValueAsNumber('pet_attribute_passiveincome')
            },
            age: {
                value: getSpanValueAsNumber('pet_attribute_age'),
                timeFactor: 10,
                increment: 1,
                maxValue: 100,
                minValue: 0
            }
        }
    }
    addToPassiveIncome(ammountToAdd) {
        this.attributes.passiveincome.value += ammountToAdd
    }
    checkLoss(game) {
        if (this.attributes.health.value === this.attributes.health.minValue || this.attributes.age.value === this.attributes.age.maxValue) {
            game.lose()
        }
    }
    updateTimeboundAttributes(game) {
        for (let attribute in this.attributes) {
            let currAttr = this.attributes[attribute]
            if (game.time % currAttr.timeFactor === 0) {
                this.changeAttributeValue(attribute, currAttr.increment)
                if (attribute === 'age') {
                    let passiveIncomeThisYear = this.attributes.passiveincome.value * (1 + (this.attributes.will.value / 100))
                    if(passiveIncomeThisYear > 0) {
                        log('player', `Growing older, now ${this.attributes.age.value} years old, but also richer. Added $${passiveIncomeThisYear} from passive income.`)
                    } else {
                        log('player', `Growing older, now ${this.attributes.age.value} years old.`)
                    }
                    this.attributes.money.value += this.attributes.passiveincome.value * (1 + (this.attributes.will.value / 100))
                }
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
    }
    enableControlButtons() {
        if (this.attributes.hunger.value > 0) {
            setElementActive('feed', true)
        } else {
            setElementActive('feed', false)
        }
        if (this.attributes.sleepiness.value > 0) {
            setElementActive('sleep', true)
        } else {
            setElementActive('sleep', false)
        }
        if (this.attributes.boredom.value > 0) {
            setElementActive('entertain', true)
        } else {
            setElementActive('entertain', false)
        }
        if (this.attributes.will.value < this.attributes.will.maxValue) {
            setElementActive('read', true)
        } else {
            setElementActive('read', false)
        }
        setElementActive('work', true)
    }
    feed() {
        this.changeAttributeValue('hunger', -5)
        this.changeAttributeValue('money', -20)
        if (probabilityCheck(50)) {
            this.changeAttributeValue('hunger', -5)
            this.changeAttributeValue('sleepiness', 5)
        } 
    }
    sleep() {
        this.changeAttributeValue('sleepiness', -5)
        this.changeAttributeValue('hunger', 5)
        this.changeAttributeValue('money', -50)
        if (probabilityCheck(50)) {
            this.changeAttributeValue('hunger', 5)
            this.changeAttributeValue('sleepiness', -5)
            this.changeAttributeValue('boredom', 5)
        }        
    }
    entertain() {
        this.changeAttributeValue('boredom', -5)
        this.changeAttributeValue('money', -20)
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
            this.changeAttributeValue('money', 500 * (1 + (this.attributes.will.value / 100)))
        }
    }
}

//end of pet class
//start of marketplace class

class Marketplace {
    constructor() {
        if (Marketplace._instance) {
            return Marketplace._instance
        }
        Marketplace._instance = this
        this.items = [
            {
                name: 'Meditations of Marcus Aurelius',
                showAt: 0,
                price: 500,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 10)} 
            },
            {
                name: 'Letters from a Stoic by Seneca',
                showAt: 0,
                price: 500,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 10)}
            },
            {
                name: '10-Day Self-Improvement Wilderness Retreat',
                showAt: 1000,
                price: 5000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 20)}
            },
            {
                name: '30-Day Total Life Overhaul Wilderness Retreat',
                showAt: 3000,
                price: 15000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 40)}
            },
            {
                name: 'Starter Investment Package',
                showAt: 10000,
                price: 50000,
                givesYou: 'a $5,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(5000)}
            },
            {
                name: 'Intermediate Investment Package',
                showAt: 50000,
                price: 100000,
                givesYou: 'a $12,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(5000)}
            },
            {
                name: 'A year in Tibet',
                showAt: 50000,
                price: 100000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 80)}
            },
            {
                name: 'GRAF MONEY Investment Package',
                showAt: 75000,
                price: 200000,
                givesYou: 'a $50,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(50000)}
            },
            {
                name: 'NYC Apartment',
                showAt: 200000,
                price: 1000000,
                givesYou: 'a $100,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(50000)}
            },
            {
                name: 'NYC Building',
                showAt: 1000000,
                price: 10000000,
                givesYou: 'a $1,000,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(1000000)}
            },
            {
                name: 'Small Island',
                showAt: 10000000, 
                price: 100000000,
                givesYou: 'a $10,000,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(10000000)}
            },
            {
                name: 'Your own Buddhist monk',
                showAt: 30000,
                price: 300000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 240)}
            },
            {
                name: 'Stack Upload',
                showAt: 100000000,
                price: 1000000000,
                givesYou: 'victory',
                available: 1,
                effect: (pet, game) => {game.win()}
            } 
        ]
    }
    processButtons(pet, game) {
        const marketplaceContainer = document.getElementById('marketplace_container')
        while (marketplaceContainer.firstChild) {
            marketplaceContainer.removeChild(marketplaceContainer.lastChild)
        } 
        this.items.forEach(element => {
            if (element.available > 0 && pet.attributes.money.value >= element.showAt) {
                let newButton = document.createElement('button')
                newButton.innerHTML = `<h4>Buy '${element.name}' for $${element.price}.<br>It will give you ${element.givesYou}.<br>${element.available} left.</h4>`
                newButton.disabled = pet.attributes.money.value < element.price
                newButton.addEventListener('click', () => {
                    pet.inventory.push(element)
                    element.available -= 1
                    pet.changeAttributeValue('money', -(element.price))
                    element.effect(pet, game)
                })
                marketplaceContainer.appendChild(newButton)
            }
        })
    }
}

//end of marketplace class

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
        playerPet.updateTimeboundAttributes(game)
        playerPet.enableControlButtons()
        playerPet.incrementHealth()
        market.processButtons(playerPet, game)
        playerPet.writeAttributes()
        playerPet.checkLoss(game)
        console.log(playerPet)
    }
}

//end of time and main game controller

//basic getters and setters, other core functionality

function configureGame() {
    const petName = document.getElementById('pet_attribute_name_enterfield').value
    setSpan('pet_attribute_name', petName)
    setElementVisibility('controls_and_stats', true)
    setElementVisibility('config', false)
    setElementVisibility('marketplace', true)
    setElementVisibility('log', true)
    setElementActive('play', true)
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

function log(level, message) {
    switch (level) {
        case "player":
            prependPTag('log_container', message)
            console.log(message)
            break
        case "console":
            console.log(message)
            break
        default:
            console.log(`Logging function did not get a valid level, the message was ${message}`)
    }
}

function prependPTag(parentid, message) {
    let parentElemenet = document.getElementById(parentid)
    let newPEntry = document.createElement("p")
    let textNode = document.createTextNode(message)
    newPEntry.append(textNode)
    parentElemenet.prepend(newPEntry)
}

function toggleElementVisibility(id) {
    console.log(`toggling visibility of ${id}`)
    let element = document.getElementById(id)
    if (element.style.display === 'none') {
        element.style.display = 'block'
    } else {
        element.style.display = 'none'
    }
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