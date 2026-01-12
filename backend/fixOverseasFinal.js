const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

console.log(`Total players loaded: ${data.players.length}`);

const targetPlayers = [
    // Problematic / Missed in previous runs
    'Ali Khan', 'Alex Carey', 'Andre Fletcher', 'Joshua Brown', 'AM Ghazanfar',
    'Saurabh Netravalkar',

    // Full List Recap (Just to be safe, standardizing names)
    'David Warner', 'Steve Smith', 'Steven Smith', 'Glenn Maxwell', 'Marcus Stoinis', 'Pat Cummins',
    'Mitchell Starc', 'Travis Head', 'Mitchell Marsh', 'Cameron Green', 'Tim David',
    'Jason Behrendorff', 'Adam Zampa', 'Nathan Lyon', 'Josh Inglis', 'Jake Fraser-McGurk',
    'Jhye Richardson', 'Nathan Ellis', 'Sean Abbott', 'Ben Dwarshuis', 'Ashton Turner',
    'Spencer Johnson', 'Daniel Sams', 'Aaron Hardie', 'Matthew Wade', 'Kane Richardson',
    'Jos Buttler', 'Phil Salt', 'Philip Salt', 'Liam Livingstone', 'Will Jacks', 'Sam Curran',
    'Tom Curran', 'Jofra Archer', 'Mark Wood', 'Harry Brook', 'Ben Duckett', 'Jonny Bairstow',
    'Moeen Ali', 'Adil Rashid', 'Chris Woakes', 'Reece Topley', 'David Willey', 'Gus Atkinson',
    'Tymal Mills', 'Tom Banton', 'Tom Kohler-Cadmore', 'Chris Jordan', 'Dawid Malan',
    'Jason Roy', 'Luke Wood', 'Richard Gleeson', 'Ollie Pope', 'Jamie Overton',
    'Heinrich Klaasen', 'David Miller', 'Aiden Markram', 'Faf du Plessis', 'Kagiso Rabada',
    'Marco Jansen', 'Gerald Coetzee', 'Lungi Ngidi', 'Anrich Nortje', 'Tristan Stubbs',
    'Nandre Burger', 'Rilee Rossouw', 'Rassie van der Dussen', 'Dewald Brevis', 'Wiaan Mulder',
    'Quinton de Kock', 'Keshav Maharaj', 'Tabraiz Shamsi', 'Wayne Parnell', 'Donovan Ferreira',
    'Corbin Bosch', 'Duan Jansen', 'Sisanda Magala',
    'Kane Williamson', 'Trent Boult', 'Devon Conway', 'Rachin Ravindra', 'Daryl Mitchell',
    'Mitchell Santner', 'Lockie Ferguson', 'Glenn Phillips', 'Finn Allen', 'Matt Henry',
    'Tim Southee', 'Adam Milne', 'Ish Sodhi', 'Kyle Jamieson', 'James Neesham', 'Michael Bracewell',
    'Mark Chapman', 'Will Young', 'Tom Latham', 'Henry Nicholls', 'Colin Munro', 'Martin Guptill',
    'Andre Russell', 'Sunil Narine', 'Nicholas Pooran', 'Shimron Hetmyer', 'Rovman Powell',
    'Romario Shepherd', 'Shai Hope', 'Alzarri Joseph', 'Akeal Hosein', 'Kyle Mayers',
    'Sherfane Rutherford', 'Oshane Thomas', 'Jason Holder', 'Obed McCoy', 'Evin Lewis',
    'Fabian Allen', 'Odean Smith', 'Dominic Drakes', 'Johnson Charles', 'Shamar Joseph',
    'Brandon King', 'Alick Athanaze', 'Keacy Carty', 'Roston Chase',
    'Rashid Khan', 'Mohammad Nabi', 'Noor Ahmad', 'Rahmanullah Gurbaz', 'Naveen-ul-Haq',
    'Fazalhaq Farooqi', 'Mujeeb Ur Rahman', 'Azmatullah Omarzai', 'Allah Ghazanfar',
    'Gulbadin Naib', 'Mohammad Shahzad', 'Hazratullah Zazai', 'Ibrahim Zadran', 'Najibullah Zadran',
    'Matheesha Pathirana', 'Wanindu Hasaranga', 'Maheesh Theekshana', 'Dilshan Madushanka',
    'Dushmantha Chameera', 'Dasun Shanaka', 'Nuwan Thushara', 'Chamika Karunaratne',
    'Kusal Mendis', 'Pathum Nissanka', 'Bhanuka Rajapaksa', 'Vijayakanth Viyaskanth',
    'Charith Asalanka', 'Dunith Wellalage', 'Avishka Fernando',
    'Riley Meredith', 'Lance Morris', 'Ashton Agar', 'Moises Henriques', 'Ben Cutting',
    'Dwaine Pretorius', 'Andile Phehlukwayo', 'George Linde',
    'Sam Billings', 'George Garton', 'David Payne', 'Laurie Evans',
    'Sikandar Raza', 'Josh Little', 'Shakib Al Hasan', 'Mustafizur Rahman', 'Litton Das', 'Taskin Ahmed',
    'Ben Sears', 'Benny Howell', 'Bevon Jacobs', 'Brandon McMullen', 'Brydon Carse', 'Chris Green',
    'Cooper Connolly', 'Dan Lawrence', 'Dan Mousley', 'Daniel Worrall', 'Daryn Dupavillon',
    'Dumindu Sewmina', 'Dushan Hemantha', 'Eshan Malinga', 'Faridoon Dawoodzai', 'Gudakesh Motie',
    'Hasan Mahmud', 'Hilton Cartwright', 'Jacob Bethell', 'James Anderson', 'James Vince',
    'Jeffrey Vandersay', 'John Turner', 'Jordan Cox', 'Josh Philippe', 'Junior Dala', 'Kamindu Mendis',
    'Keemo Paul', 'Kyle Verreynne', 'Lahiru Kumara', 'Leus du Plooy', 'Mahedi Hasan', 'Matthew Forde',
    'Matthew Potts', 'Matthew Short', 'Mehidy Hasan Miraz', 'Michael Neser', 'Michael Pepper',
    'Mikyle Louis', 'Muhammed Adnan Khan', 'Nahid Rana', 'Nangeyalia Kharote', 'Nathan Smith',
    'Nqabayomzi Peter', 'Oliver Davies', 'Olly Stone', 'Ottneil Baartman', 'Patrick Kruger',
    'Richard Ngarava', 'Rishad Hossain', 'Sediqullah Atal', 'Tanveer Sangha', 'Tanzim Hasan Sakib',
    'Tim Seifert', 'Towhid Hridoy', 'Unmukt Chand', 'Will Sutherland', 'William O’Rourke', 'Zahir Khan',
    'Zakary Foulkes',
    // USA
    'Andries Gous', 'Harmeet Singh', 'Corey Anderson', 'Aaron Jones', 'Monank Patel', 'Kwena Maphaka'
];

let updatedCount = 0;

targetPlayers.forEach(targetName => {
    // Fuzzy matching: ignore case, trim
    const player = data.players.find(p => p.name.trim().toLowerCase() === targetName.trim().toLowerCase());

    if (player) {
        if (!player.overseas) {
            console.log(`[UPDATE] Found ${player.name} (Matched: "${targetName}") -> Marking Overseas`);
            player.overseas = true;
            updatedCount++;
        } else {
            // console.log(`[OK] ${player.name} is already overseas.`);
        }
    } else {
        console.log(`[WARNING] Could not find player in DB: "${targetName}"`);
    }
});

console.log(`\nTotal updated in this run: ${updatedCount}`);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('File saved successfully.');
