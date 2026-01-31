use rayon::prelude::*;
use std::env;
use std::ops::RangeInclusive;

#[derive(Clone, Copy, Debug)]
struct Stats {
    bravery: f32,
    nervousness: f32,
    sympathy: f32,
}

fn stats_from_id(id: i32) -> Stats {
    // Placeholder formulas – replace with real Rain World logic
    let x = id as f32;
    Stats {
        bravery: ((x * 0.1).sin() + 1.0) * 0.5,
        nervousness: ((x * 0.07).cos() + 1.0) * 0.5,
        sympathy: ((x * 0.05 + 2.0).sin() + 1.0) * 0.5,
    }
}

fn distance(a: Stats, b: Stats) -> f32 {
    (a.bravery - b.bravery).abs()
        + (a.nervousness - b.nervousness).abs()
        + (a.sympathy - b.sympathy).abs()
}

fn parse_arg(idx: usize, default: f32) -> f32 {
    env::args()
        .nth(idx)
        .and_then(|s| s.parse::<f32>().ok())
        .unwrap_or(default)
}

fn parse_i64(idx: usize, default: i64) -> i64 {
    env::args()
        .nth(idx)
        .and_then(|s| s.parse::<i64>().ok())
        .unwrap_or(default)
}

fn main() {
    // Args:
    // 1: bravery   2: nervousness   3: sympathy
    // 4: start_id  5: end_id
    let target = Stats {
        bravery: parse_arg(1, 0.5),
        nervousness: parse_arg(2, 0.5),
        sympathy: parse_arg(3, 0.5),
    };

    let start_id = parse_i64(4, i32::MIN as i64) as i32;
    let end_id = parse_i64(5, i32::MAX as i64) as i32;

    let range: RangeInclusive<i32> = start_id..=end_id;

    println!(
        "Searching IDs from {} to {} for target {:?}",
        start_id, end_id, target
    );

    let (best_id, best_dist) = range
        .into_par_iter()
        .map(|id| {
            let s = stats_from_id(id);
            let d = distance(target, s);
            (id, d)
        })
        .reduce(
            || (0, f32::INFINITY),
            |acc, x| if x.1 < acc.1 { x } else { acc },
        );

    println!("Best ID: {}  |  distance: {}", best_id, best_dist);
    let best_stats = stats_from_id(best_id);
    println!("Stats at best ID: {:?}", best_stats);
}
