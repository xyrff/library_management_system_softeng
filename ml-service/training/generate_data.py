import pandas as pd
import numpy as np
import random

# Setting a seed means anyone re-running this gets the exact same "random"
# data — important for reproducibility, same as your other ML projects
np.random.seed(42)
random.seed(42)

N_SAMPLES = 4000

GENRES = [
    "Fiction", "Science", "History", "Fantasy", "Biography",
    "Technology", "Philosophy", "Art"
]


def generate_dataset(n=N_SAMPLES):
    rows = []

    for _ in range(n):
        # --- Features ---
        late_return_history = np.random.choice(
            [0, 1, 2, 3, 4, 5],
            # most students have 0 past late returns
            p=[0.55, 0.20, 0.12, 0.07, 0.04, 0.02]
        )
        # matches your 1-30 day picker range
        loan_duration = np.random.randint(3, 31)
        genre = random.choice(GENRES)
        day_of_week = np.random.randint(0, 7)  # 0=Monday ... 6=Sunday

        # --- Label generation: realistic rules + randomness ---
        # Start with a base probability of being late
        risk_score = 0.05  # baseline 5% chance even for a "perfect" borrower

        # Past behavior is the strongest signal
        risk_score += late_return_history * 0.12

        # Longer loans = more chances to forget
        risk_score += (loan_duration / 30) * 0.15

        # Some genres (denser/academic) correlate with slower reading
        if genre in ["Technology", "Philosophy", "Science"]:
            risk_score += 0.05

        # Weekend borrows (Fri/Sat/Sun) slightly more likely to be late
        if day_of_week in [4, 5, 6]:
            risk_score += 0.03

        # Cap it so it's never a guaranteed outcome — real life always has noise
        risk_score = min(risk_score, 0.85)

        # Actually "roll the dice" using this probability to decide the label
        returned_late = np.random.rand() < risk_score

        rows.append({
            "lateReturnHistory": late_return_history,
            "loanDurationDays": loan_duration,
            "genre": genre,
            "dayOfWeekBorrowed": day_of_week,
            "returnedLate": int(returned_late),
        })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    df = generate_dataset()
    df.to_excel("synthetic_loans.xlsx", index=False, engine="openpyxl")
    print(f"Generated {len(df)} synthetic loan records.")
    print(df["returnedLate"].value_counts(normalize=True))
