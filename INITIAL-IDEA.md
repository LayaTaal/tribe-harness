# AI Harness
The goal of this project is to setup a standard workflow for AI agents based on my typical process. This involves picking up tickets from Jira, and working on them through the full lifecycle of development, QA, and completion. This is a flexible system that includes a collection of skills, subagents, and other tools to make AI driven development smooth and less prone to hallucinations and errors. It is my personal assistant that supplements my skills, helping me plan and think through complex problems; push back on me when I am heading in the wrong direction; reviews my code and performs thorough testing; and helps write pull requests and testing instructions.

It is designed specifically to work with my Modern Tribe company work, which involves a wide variety of projects, mostly focused around the WordPress ecosystem, but not limited to it. 

## What this should do

- Improve the outcome of working with agents on tickets. Better results, fewer hallucinations and bad sugestions
- Give me a consistent workflow that I use for most of all of my work
- Improve token efficiency when working with agents
- Help me catch major issues earlier in the development lifecycle
- Sit on top of project specific agent instructions like AGENTS.md and Claude.md
- Primarily intended to work with Claude

## What this should not be

- Overly complex
- Cause skills and subagents to comppete and conflict
- Make working with agents harder and longer by using unnecessary/too many tools, skills, etc.

## My typical week

1. Start my week by reviewing tickets planned for the week. Prioritize them and plan a rough schedule for what I work on each day.
2. Every morning I start by checking Slack and Jira for any urgent messages or requests. Those must be prioritized over any existing planned work.
3. I preserve 30 minutes every morning for reading/learning something related to my work. This could be watching YouTube videos, working through development experiments, reading articles, etc.
4. At the end of each day I save 30 minutes to an hour to provide code reviews.
5. My goal each day is 4 hours of solid focus time for active development work.
6. Fridays are focused on learning and trying out new things. This often includes working on projects that may help with process improvements or tools for engineers to help us with our work.

## My development workflow

I generally group work into two categories - simple tickets that are usually 3 hours or less of development time, and more complex tickets that require deeper thought and planning. Depending on which category the ticket falls into, my workflow is slightly different. Simple requests, for example, may not require overly detailed development plans and brainstorming sessions and extra reviews by independent agents. I want to turn this workflow into a Graphviz representation to visualize the decision tree.

### Example workflow

1. I pick up a new ticket from Jira
2. Understand the request and desired outcome from the ticket. Think through the ticket at a high level to make sure I understand it. Flag any questions, missing scope, or other things that may block me from completing the work.
3. Once I am satisfied I understand the request and have everything necessary, begin brainstorming a solution for the ticket. Think through different ideas, weigh the pros and cons of each, and decide on a direction.
4. Build a development plan. This is intended to be handed over to a an agent specialized in development.
5. Proceed with active development.
6. Test the changes where relevant, this may be in the browser, with API requests, etc.
7. Review the code, look for possible bugs, areas to refactor or simplify, or no longer needed code
8. Iterate steps 5-7 until I'm satisfied.
9. Put up a pull request
10. Write testing instructions to my Jira ticket

## Organizing generated files
Create a standard organizational structure for AI generated markdown files used in this process.

For temporary files that we don't intend to commit to Git, store outside of projects in ~/code/tribe/tmp.
For process files that are not temporary store within projects as described in the example below. The example is not exhaustive of all files that may be included.

- /my-project
--/plans
---- /TICKET-ID
------ brainstorm.md
------ development-plan.md
------ code-review-findings.md

## Utilities
These are tools within this project that may not be within an everyday workflow but can be used ad-hoc when needed.

- Ticket estimation: help me review a ticket and estimate the development time
- Handoff: A way to quickly recap an agent session to handoff to a new agent. This is intended to be used when wrapping up a session or when context is becoming too full. I currently use [Matt Pockocks handoff skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md). We can continue using that or create our own in this project
- Grill Me: Again, I love using [Matt Pocock's grill me skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) to verify a plan before moving forward. I'm open to continuing to use that or including one here.

## Existing tools that supplement this harness
Thes are skills and other AI tools that already exist which I use regularly. They should be included in the workflow and not duplicated in this project.

- [Tribe Skills](https://github.com/moderntribe/tribe-skills) - This is important guidance on standard company patterns like our Git workflow and how to write and format testing instructions for Jira. These must be preferred.

## Inspiration
These are similar projects I like. Some may be more exhaustive and robust than what I want here. I prefer to start small and build on this instead of trying to architect everything at once.

- [Matt Pocock](https://github.com/mattpocock)
- [Superpowers](https://github.com/obra/superpowers)
- [Spec Kit](https://github.com/github/spec-kit)