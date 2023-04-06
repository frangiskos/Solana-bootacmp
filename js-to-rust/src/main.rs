fn main() {
    let apples = 6;
    let message = if apples > 10 {
        "Lots of apples"
    } else if apples > 4 {
        "A few apples"
    } else {
        "Not many apples at all"
    };

    println!("{:?}", message) // prints "A few apples"
}
