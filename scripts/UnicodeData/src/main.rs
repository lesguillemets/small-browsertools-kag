use std::fs::File;
use std::io::{BufRead, BufReader, BufWriter, Write};

fn do_split(f: &str) -> std::io::Result<()> {
    let file = File::open(f)?;
    let reader = BufReader::new(file);
    let mut current_group = String::from("00");
    let mut writer = BufWriter::new(File::create(format!("split/{current_group}.txt"))?);
    for l in reader.lines() {
        let l = l?;
        let code = l.split(';').next().unwrap();
        let cg = get_code_group(code);
        if cg != current_group {
            writer.flush().unwrap();
            current_group = String::from(cg);
            writer = BufWriter::new(File::create(format!("split/{current_group}.txt"))?);
        }
        writeln!(writer, "{}", l)?;
    }
    Ok(())
}

fn get_code_group(code: &str) -> &str {
    if code.len() == 4 {
        // 00BD -> put under 00.txt
        &code[..2]
    } else if code.len() == 5 {
        &code[..3]
    } else {
        eprintln!("unexpected length of code point, {code}");
        &code[..code.len() - 2]
    }
}

fn main() {
    do_split("../UnicodeData.txt").unwrap();
}
