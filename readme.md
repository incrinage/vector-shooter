Vector Shooter

red circle - turret
blue circle - player

turrets shoot at player

Damage System
---
Actors will have mass 
Actors collide and take damage equal to the difference of their masses
Actors with no health will be despawned using the Despawn System

Despawn System
---
Removes Actors from List<Actor> that have been given to despawn
The function App.checkActivity(List<Actor>) will return all Actors that are not active
Actor.isActive():boolean will be used to check activity 

