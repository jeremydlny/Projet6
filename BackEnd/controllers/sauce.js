/* Import des modules necessaires */
const Sauce = require("../models/sauce");
const fs = require('fs');

/* Controleur creation sauce */
exports.createSauce = (req, res, next) => {

    const sauceObject = JSON.parse(req.body.sauce);

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });

    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

/* Controleur recuperation all sauces */
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            })
        });
};

/* Controleur recuperation 1 sauce */
exports.getOneSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            })
        });
};

/* Controleur modification sauce */
exports.modifySauce = (req, res, next) => {
    const SauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...SauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));


};

/* Controleur suppression sauce */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

/* Controleur like dislike */
// Regle likeDislikeSauce : Like = 1 _ Dislike = -1 _ Pas de vote = 0
exports.likeDislikeSauce = (req, res, next) => {
    let likeDislike = parseInt(req.body.like);
    Sauce.findOne({
        // id de la sauce
        _id: req.params.id,
    })
        .then((sauce) => {
            // Si sauce like = 1
            if (likeDislike === 1) {
                sauce.likes++;
                // sauvegarde userId pour savoir si il a voté
                sauce.usersLiked.push(req.body.userId);
                // MAJ de la sauce avec données modifiées
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        likes: sauce.likes,
                        usersLiked: sauce.usersLiked,
                        _id: req.params.id,
                    }
                )
                    .then(() => res.status(200).json({ message: "Tu like ce produit !" }))
                    .catch((error) => res.status(400).json({ error }));
                // Si sauce dislike = -1
            } else if (likeDislike === -1) {
                sauce.dislikes++;
                // sauvegarde userId pour savoir il si a voté
                sauce.usersDisliked.push(req.body.userId);
                // MAJ de la sauce avec données modifiées
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        dislikes: sauce.dislikes,
                        usersDisliked: sauce.usersDisliked,
                        _id: req.params.id,
                    }
                )
                    .then(() =>
                        res.status(200).json({ message: "Tu dislike ce produit !" })
                    )
                    .catch((error) => res.status(400).json({ error }));

                // verification et remise a zero sauce like et dislike
            } else if (likeDislike === 0) {
                // si userId est dans usersLiked = user like
                if (sauce.usersLiked.includes(req.body.userId)) {
                    // - 1 au like
                    sauce.likes--;
                    // userId est retirer du tableau = user ne like plus
                    const index = sauce.usersLiked.indexOf(req.body.userId);
                    console.log(index)
                    console.log(sauce.usersLiked)
                    sauce.usersLiked.splice(index, 1);
                    console.log(sauce.usersLiked)
                    // MAJ de la sauce avec données modifiées
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            likes: sauce.likes,
                            usersLiked: sauce.usersLiked,
                            _id: req.params.id,
                        }
                    )
                        .then(() =>
                            res.status(200).json({ message: "Tu ne like plus ce produit !" })
                        )
                        .catch((error) => res.status(400).json({ error }));
                    // si userId est dans usersDisliked = user dislike
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    // - 1 au dislike
                    sauce.dislikes--;
                    // userId est retirer du tableau = user ne dislike plus
                    const index = sauce.usersDisliked.indexOf(req.body.userId);

                    console.log(index)
                    console.log(sauce.usersLiked)
                    sauce.usersDisliked.splice(index, 1);
                    console.log(sauce.usersLiked)
                    // MAJ de la sauce avec données modifiées
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            dislikes: sauce.dislikes,
                            usersDisliked: sauce.usersDisliked,
                            _id: req.params.id,
                        }
                    )
                        .then(() =>
                            res
                                .status(200)
                                .json({ message: "Tu ne dislike plus ce produit !" })
                        )
                        .catch((error) => res.status(400).json({ error }));
                }
            }
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });

};

