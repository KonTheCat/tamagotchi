class Game {
    constructor () {
        this.time = getSpanValueAsNumber('game_attribute_time')
        this.state = document.getElementById('game_attribute_state').textContent
        this.pauseCount = getSpanValueAsNumber('game_attribute_count_pauses')
        this.soundtrack = new Audio('https://konthecat.blob.core.windows.net/public/money.mp3')
    }
    incrementTime() {
        changeSpanValueNumber('game_attribute_time', 1)
        this.time += 1
    }
    setState(state) {
        document.getElementById('game_attribute_state').textContent = state
        this.state = state
    }
    pause() {
        this.setState('paused')
        setElementActive('play', true)
        setElementActive('pause', false)
        changeSpanValueNumber('game_attribute_count_pauses', 1)
        setElementActiveClass('pet_control', false)
        setElementActiveClass('marketplace_item', false)
    }
    play() {
        this.setState('playing')
        setElementActive('pause', true)
        setElementActive('play', false)
        setElementActiveClass('pet_control', true)
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
        document.getElementById('soundtrack_button').addEventListener('click', () => this.toggleSoundtrack())
        //note text on the bottom (1) from GPT-4 about why this.play etc did not work.
    }
    setUpSoundtrack() { 
        this.soundtrack.volume = 0.25
        this.soundtrack.loop = true
    }
    toggleSoundtrack() {
        const currentState = document.getElementById('soundtrack_state').textContent
        if (currentState === 'Play Soundtrack') {
            this.soundtrack.play()
            document.getElementById('soundtrack_state').textContent = 'Pause Soundtrack'
        } else {
            this.soundtrack.pause()
            document.getElementById('soundtrack_state').textContent = 'Play Soundtrack'
        }
    }
}

class Pet {
    constructor() {
        this.name = document.getElementById('pet_attribute_name').textContent
        this.evolved = false
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
                    this.ageProcessor()
                }
            }
        }
    }
    ageProcessor(){
        let passiveIncomeThisYear = this.attributes.passiveincome.value * (1 + (this.attributes.will.value / 100))
        if(passiveIncomeThisYear > 0) {
            log('player', `Growing older, now ${this.attributes.age.value} years old, but also richer. Added $${passiveIncomeThisYear} from passive income.`)
        } else {
            log('player', `Growing older, now ${this.attributes.age.value} years old.`)
        }
        this.attributes.money.value += this.attributes.passiveincome.value * (1 + (this.attributes.will.value / 100))

        if(this.evolved == false && this.attributes.age.value >=51) {
            log('player', 'You are lacking in the Will needed to evolve into your next form.')
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
        if (proposedNewValue >= currentAttribute.maxValue) {
            this.attributes[attribute].value = currentAttribute.maxValue
            setPetAttributeValue(attribute, currentAttribute.maxValue)
            return
        }
        if (proposedNewValue <= currentAttribute.minValue) {
            this.attributes[attribute].value = currentAttribute.minValue
            setPetAttributeValue(attribute, currentAttribute.minValue)
            return
        }
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
        setDivPosition('tama', 55, 84)   
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
        setDivPosition('tama', 15, 25)        
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
        setDivPosition('tama', 20, 74)  
    }
    read() {
        this.changeAttributeValue('hunger', 5)
        this.changeAttributeValue('sleepiness', 5)
        this.changeAttributeValue('boredom', 5)
        if (probabilityCheck(25)) {
            this.changeAttributeValue('will', 5)
        }
        setDivPosition('tama', 85, 50) 
    }
    work() {
        this.changeAttributeValue('hunger', 5)
        this.changeAttributeValue('sleepiness', 5)
        this.changeAttributeValue('boredom', 5)
        this.changeAttributeValue('money', 100)
        if (probabilityCheck(this.attributes.will.value)) {
            this.changeAttributeValue('money', 500 * (1 + (this.attributes.will.value / 100)))
        }
        setDivPosition('tama', 60, 13) 
    }
    checkInventory(itemName) {
        const inventoryItems = []
        this.inventory.forEach(element => {
            inventoryItems.push(element.name)
        });
        if (inventoryItems.indexOf(itemName) >= 0) {
            return true
        } else {
            return false
        }
    }
    checkEvolution() {
        if (this.evolved == false && this.attributes.age.value >= 50 && this.attributes.will.value >= 100) {
            this.evolved = true
            document.getElementById('tama_image').style.content = 'url(https://konthecat.blob.core.windows.net/public/tama6.png)'
            log('player', 'Your Tama has evolved. All that is needless is stripped away, the power of your Will is manifest in the world!')
        }
    }
    proposeName() {
        const sampleNames = ["LeaseLurker", "FeeFiend", "TollTaker", "RentRover", "DuesDrone", "TariffTrapper", "MonopolistMage", "PatentPrince", "RoyaltyRogue", "DividendDweller", "QuotaQuester", "LevyLord", "AssetArbiter", "GougeGuru", "MarkupMonarch", "PricePirate", "SurchargeSpecter", "CostCoyote", "ExactionExplorer", "GreedGhost", "HoardingHarbinger", "TaxationTitan", "UsuryUrchin", "BountyBandit", "FranchisePhantom", "GatekeeperGhost", "ArbitrageAdept", "RansomRanger", "SqueezeSpectre", "PremiumPhantom", "DebtDemon", "OligarchOracle", "CartelCrafter", "FiefdomFiend", "DutyDrifter", "TributeTracker", "RentierRogue", "LicensingLurker", "GraftGhoul", "KickbackCrawler", "PecuniaryPhantom", "ScarcityScout", "ControlCaster", "DominionDoyen", "EquityEnchanter", "HedgeHogger", "ImpositionImp", "JurisdictionJuggler", "LienLancer", "MonetizeMystic", "NicheNabber", "OverchargeOgre", "PayoutPhantom", "QuotaQuerent", "RacketeerRover", "SharecropShade", "TariffTyrant", "UsurpUmbra", "VigorishVagrant", "WarrantWraith", "YieldYogi", "ZoningZealot", "AccrueAvatar", "BribeBanshee", "CovenantCreeper", "DoleDominator", "EmolumentEidolon", "FiefFollower", "GarnishGhost", "HoardHarbinger", "IndentureIcon", "JuiceJockey", "KeystoneKeeper", "LeaseholdLich", "MortgageMarauder", "NobleNabob", "OnerousOracle", "PledgePhantom", "QuarryQuester", "RentalRevenant", "SurplusSprite", "TithingTerror", "UsurpationUmpire", "VassalVulture", "WergildWanderer", "XeniumXerxes", "YokeYokel", "ZakatZephyr", "AppanageApparition", "BailmentBogle", "CorvéeCaster", "DemesneDemon", "EscheatEctoplasm", "FeudalFantom", "GuarantyGhoul", "HeriotHaunt", "ImpostIncubus", "JuristJinn", "KhanateKelpie", "LordshipLemure", "ManorialMummy", "NobilityNix", "ObligationOgre", "PrerogativePoltergeist", "QuitrentQuerent", "RegaliaRevenant", "SeigniorageSpecter", "TitheTroll", "UsufructUmbra"]
        const sampleName = sampleNames[Math.floor(Math.random() * sampleNames.length)]
        document.getElementById('pet_attribute_name_enterfield').value = sampleName
    }
}

//end of pet class
//start of marketplace class

class Marketplace {
    constructor() {
        this.items = [
            {
                name: 'Meditations of Marcus Aurelius',
                price: 500,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 10)}, 
                visible: (pet, game) => {return true}
            },
            {
                name: 'Letters from a Stoic by Seneca',
                price: 1000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 10)},
                visible: (pet, game) => {return pet.checkInventory("Meditations of Marcus Aurelius")}
            },
            {
                name: '10-Day Self-Improvement Wilderness Retreat',
                price: 5000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 20)},
                visible: (pet, game) => {return pet.checkInventory("Letters from a Stoic by Seneca")}
            },
            {
                name: '30-Day Total Life Overhaul Wilderness Retreat',
                price: 15000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 40)},
                visible: (pet, game) => {return pet.checkInventory("10-Day Self-Improvement Wilderness Retreat")}
            },
            {
                name: 'A year in Tibet',
                price: 100000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 80)},
                visible: (pet, game) => {return pet.checkInventory("30-Day Total Life Overhaul Wilderness Retreat")}
            },
            {
                name: 'Your own Buddhist monk',
                price: 300000,
                givesYou: 'more maximum will',
                available: 1,
                effect: (pet, game) => {pet.changeAttributeMaxValue('will', 240)},
                visible: (pet, game) => {return pet.checkInventory("A year in Tibet")}
            },
            {
                name: 'Starter Investment Package',
                price: 50000,
                givesYou: 'a $5,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(5000)},
                visible: (pet, game) => {return true}
            },
            {
                name: 'Intermediate Investment Package',
                price: 100000,
                givesYou: 'a $12,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(5000)},
                visible: (pet, game) => {return pet.checkInventory("Starter Investment Package")}
            },
            {
                name: 'GRAF MONEY Investment Package',
                price: 200000,
                givesYou: 'a $50,000 increase to your passive income',
                available: 2,
                effect: (pet, game) => {pet.addToPassiveIncome(50000)},
                visible: (pet, game) => {return pet.checkInventory("Intermediate Investment Package")}
            },
            {
                name: 'NYC Apartment',
                price: 1000000,
                givesYou: 'a $100,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(50000)},
                visible: (pet, game) => {return true}
            },
            {
                name: 'NYC Building',
                price: 10000000,
                givesYou: 'a $1,000,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(1000000)},
                visible: (pet, game) => {return pet.checkInventory("NYC Apartment")}
            },
            {
                name: 'Small Island',
                price: 100000000,
                givesYou: 'a $10,000,000 increase to your passive income',
                available: 20,
                effect: (pet, game) => {pet.addToPassiveIncome(10000000)},
                visible: (pet, game) => {return pet.checkInventory("NYC Building")}
            },
            {
                name: 'Stack Upload',
                price: 1000000000,
                givesYou: 'victory',
                available: 1,
                effect: (pet, game) => {game.win()},
                visible: (pet, game) => {return true}
            } 
        ]
    }
    processButtons(pet, game) {
        const marketplaceContainer = document.getElementById('marketplace_container')
        while (marketplaceContainer.firstChild) {
            marketplaceContainer.removeChild(marketplaceContainer.lastChild)
        } 
        this.items.forEach(element => {
            if (element.available > 0 && element.visible(pet, game)) {
                let newButton = document.createElement('button')
                newButton.innerHTML = `<h4>Buy '${element.name}' for $${element.price}.<br>It will give you ${element.givesYou}.<br>${element.available} left.</h4>`
                newButton.className = 'marketplace_item'
                newButton.id = element.name
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

// time and main game controller

const game = new Game()
game.registerControlButtons()
game.setUpSoundtrack()
const market = new Marketplace()
const playerPet = new Pet()
playerPet.registerControlButtons()
playerPet.proposeName()

setInterval(run, 1000);
function run() {
    if (game.state === 'playing') {
        game.incrementTime()
        playerPet.checkEvolution()
        playerPet.updateTimeboundAttributes(game)
        playerPet.enableControlButtons()
        playerPet.incrementHealth()
        market.processButtons(playerPet, game)
        playerPet.writeAttributes()
        playerPet.checkLoss(game)
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
    setElementVisibility('soundtrack', true)
    setElementVisibility('notes', true)
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

function setElementActiveClass(className, state) {
    let elements = document.getElementsByClassName(className)
    for (let element of elements) {
        setElementActive(element.id, state)
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
    let element = document.getElementById(id)
    if (element.style.display === 'none') {
        element.style.display = 'block'
    } else {
        element.style.display = 'none'
    }
}

function setDivPosition(id, topPercent, leftPercent) {
    document.getElementById(id).style.top = `${topPercent}%`
    document.getElementById(id).style.left = `${leftPercent}%`
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