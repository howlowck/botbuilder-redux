# Botbuilder Redux Middleware

## Terminology
### State
A POJO that describes the entire conversation of the bot interaction with the user. This is the only necessary object. It determines what the bot IS.

### Action
The only way to change the state. Can think of as events or request to change the state. It is an object with a type property on it along with any other information. It describes what the bot wants to do.
‎
### Dispatcher
Dispatches actions such as incoming message or found intent to the reducer. This is the connector between the action and the reducer
‎
### Reducer
Mutate the state which has previous turn data, It describes how the bot will change.

### Renderer
This is the only concept that is outside of the traditional Redux system.  Typically this is done in the view layer.  Technically this does not have to be part of this library, and is only included for convinence.  A renderer is simply a function that takes in the context and the state, and "renders" the responses to the user.

## Motivation
The goal using Redux is to make the behavior of the bot is deterministic, given the state and the series of action being dispatched. This lesses the cognitive load when developing the flow as the user only has to focus on the state at a given time. Passing only serializable data into using pure functions (what redux is all about) also makes testing the bot behavior incredibly easy. 

On top of all this, we get the rich ecosystem of tools for debugging, visualization.  For example, we can use [Remote Redux Devtools](https://github.com/zalmoxisus/remote-redux-devtools) to view all the transitions in our bot!