"""
Content-based book recommendation logic.

TODO (ML team):
1. Load book catalog (genre, author, description) from MongoDB or an exported CSV.
2. Vectorize book text features with TfidfVectorizer.
3. Compute cosine similarity between a member's borrowed books and the full catalog.
4. Return the top-N most similar book IDs, excluding books already borrowed.
"""


def get_recommendations(member_id, top_n=5):
    # Placeholder implementation — replace with the real TF-IDF + cosine similarity pipeline.
    return []
