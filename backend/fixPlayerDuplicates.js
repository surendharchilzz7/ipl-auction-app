const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

console.log(`Total players before: ${data.players.length}`);

// 1. Fix Duplicates (Remove "Steven Smith", keep "Steve Smith")
const stevenIndex = data.players.findIndex(p => p.name === 'Steven Smith');
const steveIndex = data.players.findIndex(p => p.name === 'Steve Smith');

console.log(`Steven Smith index: ${stevenIndex}`);
console.log(`Steve Smith index: ${steveIndex}`);

if (stevenIndex !== -1 && steveIndex !== -1) {
    console.log('Found both! Removing Steven Smith...');
    data.players.splice(stevenIndex, 1);
} else if (stevenIndex !== -1 && steveIndex === -1) {
    console.log('Only found Steven Smith. Renaming to Steve Smith...');
    data.players[stevenIndex].name = 'Steve Smith';
}

// 2. Check Overseas Flags
const knownOverseas = [
    // Australia
    'David Warner', 'Steve Smith', 'Steven Smith', 'Glenn Maxwell', 'Marcus Stoinis', 'Pat Cummins',
    'Mitchell Starc', 'Travis Head', 'Mitchell Marsh', 'Cameron Green', 'Tim David',
    'Jason Behrendorff', 'Adam Zampa', 'Nathan Lyon', 'Josh Inglis', 'Jake Fraser-McGurk',
    'Jhye Richardson', 'Nathan Ellis', 'Sean Abbott', 'Ben Dwarshuis', 'Ashton Turner',
    'Spencer Johnson', 'Daniel Sams', 'Aaron Hardie', 'Matthew Wade', 'Kane Richardson',

    // England
    'Jos Buttler', 'Phil Salt', 'Philip Salt', 'Liam Livingstone', 'Will Jacks', 'Sam Curran',
    'Tom Curran', 'Jofra Archer', 'Mark Wood', 'Harry Brook', 'Ben Duckett', 'Jonny Bairstow',
    'Moeen Ali', 'Adil Rashid', 'Chris Woakes', 'Reece Topley', 'David Willey', 'Gus Atkinson',
    'Tymal Mills', 'Tom Banton', 'Tom Kohler-Cadmore', 'Chris Jordan', 'Dawid Malan',
    'Jason Roy', 'Luke Wood', 'Richard Gleeson', 'Ollie Pope', 'Jamie Overton',

    // South Africa
    'Heinrich Klaasen', 'David Miller', 'Aiden Markram', 'Faf du Plessis', 'Kagiso Rabada',
    'Marco Jansen', 'Gerald Coetzee', 'Lungi Ngidi', 'Anrich Nortje', 'Tristan Stubbs',
    'Nandre Burger', 'Rilee Rossouw', 'Rassie van der Dussen', 'Dewald Brevis', 'Wiaan Mulder',
    'Quinton de Kock', 'Keshav Maharaj', 'Tabraiz Shamsi', 'Wayne Parnell', 'Donovan Ferreira',
    'Corbin Bosch', 'Duan Jansen', 'Sisanda Magala',

    // New Zealand
    'Kane Williamson', 'Trent Boult', 'Devon Conway', 'Rachin Ravindra', 'Daryl Mitchell',
    'Mitchell Santner', 'Lockie Ferguson', 'Glenn Phillips', 'Finn Allen', 'Matt Henry',
    'Tim Southee', 'Adam Milne', 'Ish Sodhi', 'Kyle Jamieson', 'James Neesham', 'Michael Bracewell',
    'Mark Chapman', 'Will Young', 'Tom Latham', 'Henry Nicholls', 'Colin Munro', 'Martin Guptill',

    // West Indies
    'Andre Russell', 'Sunil Narine', 'Nicholas Pooran', 'Shimron Hetmyer', 'Rovman Powell',
    'Romario Shepherd', 'Shai Hope', 'Alzarri Joseph', 'Akeal Hosein', 'Kyle Mayers',
    'Sherfane Rutherford', 'Oshane Thomas', 'Jason Holder', 'Obed McCoy', 'Evin Lewis',
    'Fabian Allen', 'Odean Smith', 'Dominic Drakes', 'Johnson Charles', 'Shamar Joseph',
    'Brandon King', 'Alick Athanaze', 'Keacy Carty', 'Roston Chase',

    // Afghanistan
    'Rashid Khan', 'Mohammad Nabi', 'Noor Ahmad', 'Rahmanullah Gurbaz', 'Naveen-ul-Haq',
    'Fazalhaq Farooqi', 'Mujeeb Ur Rahman', 'Azmatullah Omarzai', 'Allah Ghazanfar',
    'Gulbadin Naib', 'Mohammad Shahzad', 'Hazratullah Zazai', 'Ibrahim Zadran', 'Najibullah Zadran',

    // Sri Lanka
    'Matheesha Pathirana', 'Wanindu Hasaranga', 'Maheesh Theekshana', 'Dilshan Madushanka',
    'Dushmantha Chameera', 'Dasun Shanaka', 'Nuwan Thushara', 'Chamika Karunaratne',
    'Kusal Mendis', 'Pathum Nissanka', 'Bhanuka Rajapaksa', 'Vijayakanth Viyaskanth',
    'Charith Asalanka', 'Dunith Wellalage', 'Avishka Fernando',

    // Australia (Additions)
    'Riley Meredith', 'Lance Morris', 'Ashton Agar', 'Moises Henriques', 'Ben Cutting', 'Daniel Sams',

    // South Africa (Additions)
    'Dwaine Pretorius', 'Andile Phehlukwayo', 'George Linde',

    // England (Additions)
    'Sam Billings', 'George Garton', 'David Payne', 'Laurie Evans',

    // Others
    'Sikandar Raza', 'Josh Little', 'Shakib Al Hasan', 'Mustafizur Rahman', 'Litton Das', 'Taskin Ahmed',
    'Alex Carey', 'Ali Khan', 'Andre Fletcher', 'Ben Sears', 'Benny Howell', 'Bevon Jacobs',
    'Brandon McMullen', 'Brydon Carse', 'Chris Green', 'Cooper Connolly', 'Dan Lawrence',
    'Dan Mousley', 'Daniel Worrall', 'Daryn Dupavillon', 'Dumindu Sewmina', 'Dushan Hemantha',
    'Eshan Malinga', 'Faridoon Dawoodzai', 'Gudakesh Motie', 'Hasan Mahmud', 'Hilton Cartwright',
    'Jacob Bethell', 'James Anderson', 'James Vince', 'Jeffrey Vandersay', 'John Turner',
    'Jordan Cox', 'Josh Philippe', 'Joshua Brown', 'Junior Dala', 'Kamindu Mendis', 'Keemo Paul',
    'Kyle Verreynne', 'Lahiru Kumara', 'Leus du Plooy', 'Mahedi Hasan', 'Matthew Forde',
    'Matthew Potts', 'Matthew Short', 'Mehidy Hasan Miraz', 'Michael Neser', 'Michael Pepper',
    'Mikyle Louis', 'Muhammed Adnan Khan', 'Nahid Rana', 'Nangeyalia Kharote', 'Nathan Smith',
    'Nqabayomzi Peter', 'Oliver Davies', 'Olly Stone', 'Ottneil Baartman', 'Patrick Kruger',
    'Richard Ngarava', 'Rishad Hossain', 'Sediqullah Atal', 'Tanveer Sangha', 'Tanzim Hasan Sakib',
    'Tim Seifert', 'Towhid Hridoy', 'Unmukt Chand', 'Will Sutherland', 'William O’Rourke',
    'Zahir Khan', 'Zakary Foulkes'
];

let updatedCount = 0;
data.players.forEach(p => {
    if (knownOverseas.includes(p.name)) {
        if (!p.overseas) {
            console.log(`Fixing overseas flag for: ${p.name}`);
            p.overseas = true;
            updatedCount++;
        }
    }
});

console.log(`Updated overseas flags for ${updatedCount} players.`);
console.log(`Total players after: ${data.players.length}`);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('File saved.');
