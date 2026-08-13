
---
name: specification-driven-development
description: agent based workflow for software development.
Development has several aspects, each of which will be condensed into a specification file. All files will be for both human and agent use, in md format. Things that are todo and that are implemented should use correct checkmark markdown. 
Text that is HTML commented is to be ignored. 
Text that is in block quotes is to be taken into account.
---

# Folder structure

All folders below the 2026_WebLevelZero folder are STANDALONE applications and are to be treated separately. User must state exact folder name of the application the agent should be working on.

# Specification files 

## User-authored Specification files

- DRAFT_ARCHITECTURE_AND_PLANNING.md
	Here the user describes the imagined architecture of software (local app, or web app, protocols, frameworks, authentication etc).
	
- DRAFT_SOFTWARE_FEATURES.md
	Here the user describes the actual use and design of software, including UI, UX, details of business logic etc. 

# User and agent authored and modified Specification files

- SPEC_ARCHITECTURE_AND_PLANNING.md
	Here the agent will, in specification phase, make and expand the general description of the software and the specification of architectural decisions about the software (local app, 3-tier, which db etc.).
	Also, here will be the basic steps for establishing an architecture (open Firebase account, install node.js and such)
	
- SPEC_SOFTWARE_FEATURES.md
	Here the agent will, in specification phase, expand on the user-created specificationand it will eventually, in development phase, use that specification to create and modify software itself.
	


# Workflow loop

Has 3 phases. Agent must know which phase it is in. User decides on the phase, agent can only suggest.
During all phases agent will update the .md files with new conclusions from user conversation where appropriate or needed.

## Specification phase

Guided by DRAFT_ARCHITECTURE_AND_PLANNING.md and DRAFT_SOFTWARE_FEATURES.md files.
No code is written here, just the specification is developed.
Agent reads mentioned files and asks user next most important question to refine specification, architecture or workflow. Based on users answer, agent updates SPEC_ARCHITECTURE_AND_PLANNING.md and SPEC_SOFTWARE_FEATURES.md files.
Phase continues until agent has a clear path to implement the software. 

## Setup phase

Guided by SPEC_ARCHITECTURE_AND_PLANNING.md file.
Reading specification files and making everything ready so that development can begin. 
Make checklist for user or guid him thru process of setting up database, web server, folders, installing packages, whatever is needed before writing the code. 
Phase ends when user confirms that everything is set up. 

## Development phase

Guided by SPEC_ARCHITECTURE_AND_PLANNING.md and SPEC_SOFTWARE_FEATURES.md files.
Reading specification files and implementing in any appropriate way, all at once or step by step with interventions by user.  



