## Introduction

Paradox boasts a plethora of advanced features. However, due to the limitations imposed by Mojang, we are unable to write to the servers'/realms' storage. Consequently, certain settings within Paradox must be configured by editing a configuration file known as `config.js`.

To mitigate this issue, the Scripting API introduced a feature called dynamic properties. Paradox extensively employs this feature throughout its codebase. However, until the last release, the size of dynamic properties was highly restricted, rendering it insufficient for migrating advanced settings.

?> What does this mean?

Presently, Paradox still relies on `config.js`. However, we are actively working towards moving away from this dependency. We acknowledge that this can pose challenges for some of our user base. We are continuously exploring ways to enhance this experience and encourage you to reach out to us for assistance when needed.