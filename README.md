Consider your start object is :

var persons = {
    id: 1,
    data: [
        {
            firstname: 'John',
            lastname: 'Doe'
        },
        {
            firstname: 'Jan',
            lastname: 'Janssens'
        }
    ]
};

Now, you need to create an 

var histo = objistory.historize(persons, true);

var ops = objistory.operations;

Do your modification by this way :

histo.upd(ops.ADD, 'ageAverage', 27);
histo.upd(ops.ADD, 'data.0.age', 32);
histo.upd(ops.ADD, 'data.1.age', 23);
histo.upd(ops.ADD, 'data.0.age1', 33);
histo.upd(ops.DELETE, 'data.0.age');
histo.upd(ops.SET, 'ageAverage', 28);
histo.upd(ops.SET, 'data.0', {firstname: 'Jo', lastname: 'Doe'});

Or by this way :

histo.set('data.0', {firstname: 'Jo2', lastname: 'Doe'});
histo.add('data', {firstname: 'Joh', lastname: 'Doe'});
histo.del('data', 2);
histo.add('date', new Date());
histo.del('data');
histo.add('data', {firstname: 'John', lastname: 'Doe'});

At this point your object is at the version 13.

You can now do a restore 

histo.restoreAt(7);

You can do an apply on another object :

histo.applyOn(obj);
       
Read the code for learn more about functionalities.

Have fun !       