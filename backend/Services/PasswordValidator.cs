namespace ZakatifyApi.Services;

public static class PasswordValidator
{
    private static readonly HashSet<string> CommonPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "password","123456","12345678","qwerty","abc123","monkey","1234567","letmein",
        "trustno1","dragon","baseball","iloveyou","master","sunshine","ashley","michael",
        "shadow","123123","654321","superman","qazwsx","michael1","football","password1",
        "password123","batman","login","princess","starwars","solo","qwerty123","welcome",
        "flower","passw0rd","charlie","donald","aa123456","password1!","qwerty1","hello",
        "696969","mustang","access","master1","michael!","pass123","admin","admin123",
        "letmein1","welcome1","monkey1","dragon1","love","secret","google","apples",
        "robert","jordan","thomas","hockey","ranger","daniel","andrew","joshua","pepper",
        "harley","zaq1zaq1","matthew","buster","jennifer","killer","soccer","george",
        "andrea","debbie","jessica","louise","jennifer1","cheese","computer","corvette",
        "blahblah","hammer","tiger","dallas","william","sparky","yankees","diablo","compaq",
        "boston","tennis","banana","monster","maverick","austin","steelers","merlin",
        "diamond","bigdog","cowboy","falcon","taylor","redsox","jackson","murphy","phoenix",
        "samantha","summer","bailey","marina","midnight","test","testing","test123",
        "internet","service","canada","passport","forever","freedom","johnson","miller",
        "orange","pepper1","qwert","alexander","december","brooklyn","abcdef","hunter",
        "jordan23","ginger","porsche","butter","chelsea","black","diamond1","nascar",
        "jackson1","cameron","999999","888888","777777","lovers","player","peanut",
        "princess1","dallas1","gandalf","iceman","nothing","biteme","coffee","scooter",
        "brandy","lakers","sierra","matrix","alexis","genesis","purple","andrea1","spider",
        "ou812","champion","peaches","crystal","marines","america","fluffy","phantom",
        "indian","cottone","maxwell","golden","gaming","cookie","angels","bandit","viking",
        "wizard","einstein","copper","knight","samson","q1w2e3r4","victoria","131313",
        "summer1","looking","princess2","startrek","mercedes","thunder","welcome1!",
        "chicken","sparky1","corvette1","batman1","cacique","bulldog","packers","lovers1",
        "pumpkin","snowball","scholar","williams","animal","jasmine","creative","jessica1",
        "yankee","panther","lauren","winston","patrick","charlie1","dakota","elizabeth",
        "toyota","camaro","testing1","samsung","gateway","eagles","chicago","snoopy",
        "smokey","dakota1","joseph","hotdog","bonnie","steelers1","tucker","tigger",
        "ashley1","arsenal","Access14","rush2112","doctor","bulldog1","heaven","panther1",
        "yankees1","rainbow","rachel","rachel1","rainbow1","abcdefg","abcdefgh",
        "1q2w3e4r","1q2w3e","1q2w3e4r5t","1qaz2wsx","zaq12wsx","!@#$%^&*","pass",
        "passwd","database","server","changeme","changeit","root","toor","administrator",
        "Pa$$w0rd","P@ssw0rd","P@ssword1","Qwerty123","Password!","Password1!",
        "Passw0rd!","Winter2024","Summer2024","Spring2024","Fall2024",
        "Winter2025","Summer2025","Spring2025","Fall2025",
        "Winter2026","Summer2026","Spring2026","Fall2026",
        "january","february","march","april","may2024","june","july","august",
        "september","october","november","december2024",
        "111111","000000","121212","1234","12345","123456789","1234567890",
        "0987654321","987654321","87654321","7654321",
        "aaaaaa","qqqqqq","zzzzzz","xxxxxx","cccccc",
        "asdfgh","asdf","zxcvbn","zxcvbnm","qwertyuiop","asdfghjkl",
        "iloveu","iloveyou1","love123","lovely","lover","loveme",
        "trustno1!","letmein!","monkey123","dragon123","shadow1","sunshine1",
        "chocolate","strawberry","blueberry","raspberry",
        "qwerty12","qwerty12345","password12","password1234",
        "aaa111","abc1234","abcd1234"
    };

    public static (bool IsValid, string? Error) Validate(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            return (false, "Password must be at least 8 characters.");

        if (password.Length > 128)
            return (false, "Password must be 128 characters or less.");

        if (CommonPasswords.Contains(password))
            return (false, "This is a commonly used password. Please choose a stronger one.");

        return (true, null);
    }
}
