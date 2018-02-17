# Botbuilder Redux Middleware

** This package is targeted for Botbuilder v4 **

## Motivation
The goal using Redux is to make the behavior of the bot predictable, given the state and the series of action being dispatched. This lessens the cognitive load when developing the flow as the author of the bot only has to focus on the single state at a given time. Passing only serializable data into pure functions (what redux is all about) also makes testing the bot behavior incredibly easy. 

On top of all this, we get the rich ecosystem of tools for debugging, visualization.  For example, we can use [Remote Redux Devtools](https://github.com/zalmoxisus/remote-redux-devtools) to view all the transitions in our bot!

Here is the similarity I see between Bot design and UI Data Managment

| Bot                                          | Browser                                                  |
|----------------------------------------------|----------------------------------------------------------|
| Stateful Conversation                        | Stateful DOM                                             |
| Dispatch User Messages                       | Dispatch User Events                                     |
| Deterministic Response given State           | Deterministic View Layer given State                     |
| Needs to react to Unpredictable Prompt       | Needs to react to Unpredicable User Interaction on Page  |

## Features of using Redux as the State Manager
* Community Backed - All the redux ecosystem in your bot
* No API to learn - only needs to know the redux principles
* Single source of Truth
* Easy Testing

-------------

## Terminology
### State
A POJO that describes the entire conversation of the bot interaction with the user. This is the only necessary object. **It is the only thing that determines what the bot should do.**

### Action
The only way to change the state. Can think of as events or request to change the state. It is an object with a `type` property on it along with any other information. **It describes what the bot wants to do.**
‎
### Dispatcher
Dispatches actions such as incoming message or found intent to the reducer. **This is the connector between the action and the reducer**
‎
### Reducer
Mutate the state which has previous turn data, **It describes how the bot will change.**

### Renderer
This is the only concept that is outside of the traditional Redux system.  Typically this is done in the view layer.  Technically this does not have to be part of this library, and is only included for convinence.  A renderer is simply a function that takes in the context and the state, and **"renders" the responses to the user**.


## How to Use

**`npm install --save botbuilder-redux`**

The `BotReduxMiddleware` is meant to be unopininated on _how_ you use your redux store.  All it does is storing the state to `context.storage` for the next turn, and recreating the store from the stored state.  (The package doesn't even require redux)  It's up to the user to compose the store, and the middleware does the wiring between `context.storage` and the redux store between turns.  (Another way to look at this Middleware is that it replaces the BotStateManager, instead we use Redux as the state manager)

By default, you can retrieve the redux store from `context.reduxStore`, but you can specify your own setter function

```js
const BotReduxMiddleware, { getStore } = require('botbuilder-redux') //getStore is simply a helper function

const createStoreFunction = (stateFromStorage) => {
  // User specifies the default State if nothing is from the storage (very first turn)
  const defaultState = {requesting: null, responses: []} 
  return createStore(reducer, stateFromStorage || defaultState)
}
...
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotReduxMiddleware((stateFromStorage) => {
      const defaultState = {requesting: null, responses: []}
      return createStore(reducer, stateFromStorage || defaultState)
    }))
    .onReceive((context) => {
      reduxStore = getStore(context)
      const {getState} = reduxStore
      // control your bot with redux state
    })
```
------------
## Getting Started with the Simple Bot Example
The simple bot uses the simpliest implementation of the BotReduxMiddleware.  And It simply asks you for a name, and greets you after you answer.

1. Clone/Pull Down this Repo
2. Run `npm install`
3. Run `npm run build:dev` (or `npm run build:dev:watch`)
4. Run `npm run simplebot`
5. Check it out in the Bot Emulator

------------
## Other Examples

This package is meant to be extremely thin.  There is some established conventions that will help you get started on building a bot quickly.  A package called [`botbuilder-redux-common`](https://haoluo12.visualstudio.com/botbuilder-redux-common), has a set of helper functions and middleware.  Please refer to that package for more examples.
