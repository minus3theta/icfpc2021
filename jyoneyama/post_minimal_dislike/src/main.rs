use std::{collections::BTreeMap, fs::File, io::Read, path::PathBuf};

use easy_scraper::Pattern;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use structopt::StructOpt;

#[derive(Debug, StructOpt)]
struct Opt {
    /// HTML source file of https://poses.live/problems
    source: PathBuf,

    /// Prefix of API endpoint url to post (e.g. http://localhost/api/minimal/)
    endpoint: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Payload {
    minimal_dislike: i32,
}

fn parse_dislikes(source: &str) -> anyhow::Result<BTreeMap<i32, i32>> {
    let pat = Pattern::new(
        r#"<table><tr><td><a>{{id}}</a></td><td></td><td>{{minimal}}</td></tr></table>"#,
    )
    .unwrap();
    let ms = pat.matches(source);

    let mut map = BTreeMap::new();
    for m in ms {
        map.insert(m["id"].parse()?, m["minimal"].parse()?);
    }

    Ok(map)
}

fn read_dislikes(source: &mut impl Read) -> anyhow::Result<BTreeMap<i32, i32>> {
    let mut html = String::new();
    source.read_to_string(&mut html)?;
    parse_dislikes(&html)
}

async fn post_dislike(
    client: &Client,
    endpoint: &str,
    problem_id: i32,
    dislike: i32,
) -> anyhow::Result<()> {
    let url = format!("{}{}", endpoint, problem_id);
    let payload = Payload {
        minimal_dislike: dislike,
    };
    client.post(&url).json(&payload).send().await?;
    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let opt = Opt::from_args();

    let mut source = File::open(&opt.source)?;
    let dislikes = read_dislikes(&mut source)?;

    let client = Client::new();

    for (&id, &dislike) in &dislikes {
        post_dislike(&client, &opt.endpoint, id, dislike).await?;
    }

    Ok(())
}
