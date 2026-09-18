# Story

I've been wanting to do this heroclix project for the longest time.
The 2 things that interest me the most about it are:
First, being able to play it however I like and as much as I want, compare the figures between each other and see what makes one better to the others.
Second, the whole modeling of the solution, it is really interesting to me how it being deterministic up to the point where the dice are thrown and how the probabilities of it could be bent or overrun by the rules of the game while it being a challenging mathematic problem.

For example, 2 characters are based with each other and are engaging in combat. The most obvious question is "who wins?". And a very naive and short exploration shows that the winning character is the one that makes enough damage to the other, however that is not always the case. While the first to hit does gain a huge advantage and some cases that is enough to tilt the scales there are much more things to consider. Attacking is not the only option and the powers also come into play when determining the options. A way weaker character may win against a much stronger one if the weaker has willpower and the other one does not. On the flipside, should the stronger character push, and take that damage to guaranty the damage that will make the weaker opponent unable to damage it or wait patiently for an opening, risking being hit and ending on a worse spot?

Should a character with range try to break away, risking losing a turn? or stay and fight?
When does it actually pay off to use blades instead of regular damage?
What about critical hits and fails?
What about knockback?
To what amount does team skills help?
How does terrain affect significantly the outcome?
Is it better to have a tentpole team or a balanced one?

Obviously, the outcome of small situations, like being a couple of turns away from the end of the game is really easy to predict using the probability of the dice and other conventional means. But as more elements are added to the mix, the possible paths grow, so the probability calculation becomes inmense if we follow that path.

Returning to the starting point, the main idea is to be able to predict which team has the best probability of winning and then update that with the plays as they happen.

This makes it look like it is an optimization problem.

# Top down:

## User story 1

The user is in the middle of a heroclix match where they are unsure if the current match is going in their favor or if its even.
The user pulls out the oraclix app, inputs their team, their opponent team, map, current positions, tokens, etc.
The app then calculates which team has the advantage.

## User story 2

The user is in the final steps of a match and wants to know which is the optimal move that will give them advantage or if its already mostly lost.

## User story 3

The user wants to compare 2 heroclix figures. Since beside the combat values and the Keywords, it is not immediately discernible which one might be better because of the different powers.

## User story 4

The user wants to compare which combination of powers result in higher damage or hit probability. Either for powers that give other powers or optional powers or outwit for removing defensive powers, etc.

# Bottom-up:

## Dice

The first functions needed would be a function that given a set of dice and a target value, and returns a probability of hitting.
And a function that given a set of dice, a probability function is output.
Maybe a combination might be needed. A function that generates a hit probability function.

## Data structures

### Game

Has a map, a collection of players, a turn player, a starter player, a team cost.

### Player

A player has a team, feats.

### Team

A team has a cost limit, a cost total, an action allowance, a figure collection, a sideline collection

### Figure

A figure has a base, keywords,

### Base

A base has 1 or more dials, it also contains the collection id and number, team, ring color, movement icon, attack icon, defense icon, damage icon, targets, range, enhanced movement, enhanced targeting, trait.

### Dial

The best data structure for this will depend on the special powers, however the most identical one would be a 12 array of clix.

### Clix

A clix has a clix number, a combat value and power per: movement, attack, defense, damage.

### Combat values

A combat value is composed of a value and a power. The clix assigns if the combat value is attack, defense, movement, or damage. This is because I remember some powers affecting the colors, regardless of the combat category.

### Hidden: available powers

A list of the available powers. The difference here is that this list might contain powers given by external factors and by the same figure. Powers might stack: a figure having probability control because of a self power and a team ability.

### Hidden: current turn action

Whether the figure has already taken an action this turn. Important since the token can be removed after the action has already been executed

### Hidden: modifiers

### Bystander tokens

What's the difference between a figure and a bystander token?

### Map

A grid of squares containing different data: coordinates, terrain type, elevation, left right top bottom walls, special squares/areas, starting areas.

### Square

Can contain one of the following

- Actor
- Debris marker
- Object
- Smoke
- Barrier

### Powers

There are the basic powers and the special powers, however I would like to classify them in basic, advanced, special, where basic matches the existing basic powers, advanced are basic-like but given from other sources like interaction between 2 figures, bestowed by another figure, enhanced targeting and movement; and composed of things basic powers already do, like self-perplex, larger-area quake, blades with cap, powers that resemble existing powers with and an added extra that only modifies the mechanichs of the powers by a little. The advanced powers are the ones for which there is the need to create a new rule for their existence, like a new power, or "game breaking" things, like "STOP".

A good idea here would be to create the powers with inputs so the values can be varied, for example, blades would need a minimum, a cap, a distribution function (normally one die, could be used with different kinds of dice or a select the best of 3, which would be a requirement for the distribution functions as well)
