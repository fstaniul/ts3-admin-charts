# Teamspeak 3 Admin Charts 1.1.0
Utility for teamspeak 3 server administrators to monitor administrators activity.

# Planned features:
- ~~1.0.x~~ *(Moved to: v1.1)*
  - [ ] Add option to delete accepted accounts.
  - [ ] Add option to refresh accounts list.

- 1.1.0
  - [x] Add socket.io for live time communication between server and web.
    - [x] Live update of account list
    - [x] Live update of indicator
  - [x] Add indicator with count of not activated accounts next to admin panel link
  - [x] Add option to refresh accounts list.

- 1.1.1
  - [x] Fixed numeroues bugs.
  - [x] Changed /api/reg dates to include to date in the data set: [from, to) -> [from, to]
  - [x] Fixed errors with badge animations and hide the animation of alerts on login and signup.

- 1.1.x
  - [ ] Display count for administrator from the begining.

# Bugs:
- [x] Deletion of unaccepted users pointed to right end point and fixed server error. (04.02.2018) -> (05.02.2018) *v1.1|*
- [x] Informations about signup status. (04.02.2018) -> (05.02.2018) *v1.1*
