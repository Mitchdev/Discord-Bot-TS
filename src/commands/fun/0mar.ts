import Command from '../../structures/Command';

export default new Command({
  idType: 'ChatInputCommandInteraction',
  name: '0mar',
  description: '0MAR LMAO',
  run: async({ interaction }) => {
    await interaction.deferReply();

    if (Math.floor(Math.random() * 100) === 1) {
      interaction.editReply({content: '0m3r POG POG POG'});
    } else {
      const number = generateNumber();
      interaction.editReply({content: `0m${number === '3' ? number + generateNumber() : number}r`});
    }

  }
});

function generateNumber(): string {
  if (Math.floor(Math.random() * 3) === 1) return Math.floor(Math.random() * 10).toString() + generateNumber();
  return Math.floor(Math.random() * 10).toString();
}
