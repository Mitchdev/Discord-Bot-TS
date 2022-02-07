import { ApplicationCommandOptionType, CommandInteractionOptionResolver } from 'discord.js';
import fetch from 'node-fetch';
import Command from '../../structures/Command';
import { AnimalFact, AnimalPic } from '../../typings/apis/Animal';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: 'animal',
  description: 'Get animal fact or picture',
  options: [{
    name: 'pic',
    description: 'Get animal picture',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'animal',
      type: ApplicationCommandOptionType.Integer,
      description: 'Get animal',
      required: true,
      choices: [{
        name: 'Random',
        value: -1,
      }, {
        name: 'Ferret',
        value: 0,
      }, {
        name: 'Dog',
        value: 2,
      }, {
        name: 'Cat',
        value: 3,
      }, {
        name: 'Panda',
        value: 4,
      }, {
        name: 'Red Panda',
        value: 1,
      }, {
        name: 'Fox',
        value: 5,
      }, {
        name: 'Koala',
        value: 6,
      }, {
        name: 'Bird',
        value: 7,
      }, {
        name: 'Racoon',
        value: 8,
      }, {
        name: 'Kangaroo',
        value: 9,
      }, {
        name: 'Whale',
        value: 10,
      }],
    }]
  }, {
    name: 'fact',
    description: 'Gets random animal fact',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'animal',
      type: ApplicationCommandOptionType.Integer,
      description: 'Type of animal',
      required: true,
      choices: [{
        name: 'Random',
        value: -1,
      }, {
        name: 'Dog',
        value: 2,
      }, {
        name: 'Cat',
        value: 3,
      }, {
        name: 'Panda',
        value: 4,
      }, {
        name: 'Fox',
        value: 5,
      }, {
        name: 'Koala',
        value: 6,
      }, {
        name: 'Bird',
        value: 7,
      }, {
        name: 'Racoon',
        value: 8,
      }, {
        name: 'Kangaroo',
        value: 9,
      }, {
        name: 'Whale',
        value: 10,
      }, {
        name: 'Elephant',
        value: 11,
      }, {
        name: 'Giraffe',
        value: 12,
      }],
    }],
  }],
  run: async ({ interaction }) => {
    await interaction.deferReply();

    const animalNames = ['Ferret', 'Red Panda', 'Dog', 'Cat', 'Panda', 'Fox', 'Koala', 'Bird', 'Racoon', 'Kangaroo', 'Whale', 'Elephant', 'Giraffe'];
    const animals = ['ferret', 'red_panda', 'dog', 'cat', 'panda', 'fox', 'koala', 'birb', 'racoon', 'kangaroo', 'whale', 'elephant', 'giraffe'];
    const isPic = (interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'pic';
    const chosenIndex: number = (interaction.options.get('animal').value as number);
    const animalIndex: number = chosenIndex === -1 ? Math.floor(Math.random() * 10) + (isPic ? 0 : 2) : chosenIndex;
    const animal = animals[animalIndex];

    if (isPic) {
      const { url, link }: AnimalPic = await (await fetch(animal === 'ferret' ? process.env.ANIMAL_PIC_FERRET_API : process.env.ANIMAL_PIC_API.replace('|animal|', animal))).json() as AnimalPic;
      if (url || link) interaction.editReply(`**${animalNames[animalIndex]}**\n${url ?? link}`);
      else interaction.editReply(`Could not get pic of ${animalNames[animalIndex]}`);
    } else {
      const { fact }: AnimalFact = await (await fetch(process.env.ANIMAL_FACT_API.replace('|animal|', animal))).json() as AnimalFact;
      if (fact) interaction.editReply(`**${animalNames[animalIndex]}**\n${fact}`);
      else interaction.editReply(`Could not get fact of ${animalNames[animalIndex]}`);
    }
  }
});
